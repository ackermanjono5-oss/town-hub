import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Whether real credentials were compiled in. Guard UI on this — NOT on the
 * truthiness of the client, which is always a real object.
 *
 * The previous version fell back to 'https://placeholder.supabase.co' and
 * still returned a client, so every `if (!supabase)` check in the app was
 * dead code and SupabaseSetupNotice could never render. A missing env var
 * surfaced as an opaque network/JWT failure instead of a setup message.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // The Android build runs from file://, where there is no redirect to
      // come back to and window.location.origin is the string "null".
      // Sessions are established by verifying an emailed code in-page
      // instead, so URL detection has nothing to do and is turned off.
      detectSessionInUrl: typeof window !== 'undefined' && window.location.protocol !== 'file:',
    },
  }
)

export function getSupabaseClient() {
  return supabase;
}

/**
 * The signed-in user, read from the locally persisted session.
 *
 * Deliberately getSession() rather than getUser(): getUser() revalidates
 * against the Auth server, so in this app — which ships offline inside a
 * WebView — it can hang or reject whenever there is no connectivity, and a
 * screen that awaits it sits on its loading state forever. getSession()
 * reads the stored session, resolves offline, and is enough to answer
 * "is anyone signed in?". Anything that must trust the server (role and
 * membership checks) is enforced by RLS, not by this.
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user ?? null;
  } catch {
    return null;
  }
}
