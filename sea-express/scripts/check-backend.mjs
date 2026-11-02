/**
 * Checks the live Supabase project the app points at (.env.local), using
 * only the public anon key — the same access a visitor's phone has:
 *
 *   - every table the app reads exists, and the private ones show a
 *     visitor nothing;
 *   - the database functions exist and refuse visitors;
 *   - the Edge Functions are deployed;
 *   - the avatars storage bucket exists;
 *   - Google and email sign-in are switched on.
 *
 * It changes nothing. Run:  npm run test:backend
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* no .env.local — rely on the environment */
  }
  return env;
}

const env = loadEnv();
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL_ || !KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set (in .env.local).');
  process.exit(1);
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const NIL = '00000000-0000-0000-0000-000000000000';

let failures = 0;
let warnings = 0;
function pass(msg) {
  console.log(`  ok    ${msg}`);
}
function fail(msg) {
  failures += 1;
  console.log(`  FAIL  ${msg}`);
}
function warn(msg) {
  warnings += 1;
  console.log(`  WARN  ${msg}`);
}

async function request(path, init = {}) {
  const res = await fetch(`${URL_}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* not JSON */
  }
  return { status: res.status, body };
}

// Public tables a visitor may read rows from, and private ones where RLS
// must hand a visitor nothing.
const PUBLIC_TABLES = ['legal_notices', 'wall_posts'];
const PRIVATE_TABLES = [
  'profiles',
  'businesses',
  'offers',
  'redemption_tokens',
  'redemptions',
  'employees',
  'business_registration_codes',
  'wall_reports',
];

async function checkTables() {
  console.log('\nTables');
  for (const table of [...PUBLIC_TABLES, ...PRIVATE_TABLES]) {
    const { status, body } = await request(`/rest/v1/${table}?select=*&limit=5`);
    if (status === 404 || body?.code === 'PGRST205') {
      if (table.startsWith('wall_')) {
        fail(`${table} is missing: run supabase/migrations/0013_community_wall.sql in the Supabase SQL Editor`);
      } else {
        fail(`${table} is missing`);
      }
      continue;
    }
    if (status !== 200 || !Array.isArray(body)) {
      fail(`${table}: unexpected response ${status} ${JSON.stringify(body)}`);
      continue;
    }
    if (PRIVATE_TABLES.includes(table) && body.length > 0) {
      fail(`${table} shows ${body.length} row(s) to a visitor who isn't signed in`);
    } else {
      pass(`${table}${PRIVATE_TABLES.includes(table) ? ' (private: visitors see nothing)' : ` (${body.length} visible)`}`);
    }
  }
}

async function checkFunctions() {
  console.log('\nDatabase functions (must exist and refuse visitors)');
  const calls = {
    issue_voucher: { p_customer: NIL, p_offer: NIL },
    redeem_voucher: { p_token: NIL, p_business: NIL, p_staff: NIL, p_dry_run: true },
    register_business_with_code: { p_code: 'x', p_owner_id: NIL },
    admin_set_membership: { p_user: NIL, p_subscribed: false },
    admin_list_members: { p_search: '', p_limit: 1 },
    resubmit_business_application: {},
  };
  for (const [fn, args] of Object.entries(calls)) {
    const { status, body } = await request(`/rest/v1/rpc/${fn}`, { method: 'POST', body: JSON.stringify(args) });
    if (body?.code === 'PGRST202') fail(`${fn} is missing (or its parameters changed)`);
    else if (body?.code === '42501' || status === 401 || status === 403) pass(`${fn} exists and refuses visitors`);
    else fail(`${fn} answered a visitor with ${status} ${JSON.stringify(body)}`);
  }
}

async function checkEdgeFunctions() {
  console.log('\nEdge Functions');
  for (const fn of ['redeem-offer', 'approve-redemption', 'register-business']) {
    const res = await fetch(`${URL_}/functions/v1/${fn}`, { method: 'OPTIONS', headers: { apikey: KEY } });
    if (res.status === 404) fail(`${fn} isn't deployed`);
    else if (res.ok) pass(`${fn} is deployed`);
    else warn(`${fn} answered OPTIONS with ${res.status}`);
  }
}

async function checkStorage() {
  console.log('\nStorage');
  const { body } = await request('/storage/v1/object/public/avatars/__check__.png');
  if (body?.code === 'NoSuchBucket' || body?.error === 'Bucket not found') fail('avatars bucket is missing');
  else pass('avatars bucket exists');
}

async function checkAuth() {
  console.log('\nSign-in');
  const { status, body } = await request('/auth/v1/settings');
  if (status !== 200) {
    fail(`auth settings answered ${status}`);
    return;
  }
  if (body.external?.email) pass('email sign-in is on');
  else fail('email sign-in is off');
  if (body.external?.google) pass('Google sign-in is on');
  else warn('Google sign-in is off');
}

async function main() {
  console.log(`Checking ${URL_}`);
  await checkTables();
  await checkFunctions();
  await checkEdgeFunctions();
  await checkStorage();
  await checkAuth();
  console.log(`\n${failures} failure(s), ${warnings} warning(s).`);
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
