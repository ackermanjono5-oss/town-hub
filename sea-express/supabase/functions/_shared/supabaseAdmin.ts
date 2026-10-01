import { createClient } from 'npm:@supabase/supabase-js@2';

// Service-role client: bypasses RLS entirely. Only ever used inside Edge
// Functions, never exposed to a browser. SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are auto-injected into every function's
// runtime by Supabase — no manual secret needed for these two.
export function getAdminClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
}

// Anon-key client scoped to the caller's own JWT, used only to verify who
// is calling (auth.getUser()) — Supabase validates the token server-side.
export function getUserClient(authHeader: string) {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
}
