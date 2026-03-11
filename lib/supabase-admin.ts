import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase con Service Role Key per operazioni admin (es. creare utenti).
 * Usare SOLO lato server. Non esporre mai la service role key al client.
 */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY mancante. Aggiungila in .env.local per creare utenti da admin.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
