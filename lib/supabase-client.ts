'use client'

import { createBrowserClient } from '@supabase/ssr'

// Client per componenti client-side
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
