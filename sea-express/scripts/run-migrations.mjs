import { Client } from 'pg';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = join(__dirname, '..');
const FILES = [
  '20260605000001_init.sql',
  '0001_community_wall.sql',
  '0002_restaurant_reviews.sql',
];

const password = encodeURIComponent(process.argv[2]);
const connectionString = `postgresql://postgres:${password}@db.ytatuzohpthzatzowlgc.supabase.co:5432/postgres`;

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log('Connected.');
  for (const file of FILES) {
    const sql = await readFile(join(PROJECT_DIR, 'supabase', 'migrations', file), 'utf8');
    console.log(`\nRunning ${file}...`);
    try {
      await client.query(sql);
      console.log(`  OK`);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      throw err;
    }
  }
  console.log('\nAll migrations applied.');
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
