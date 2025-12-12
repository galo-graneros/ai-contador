import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export * from './types'

export function createSupabaseClient(supabaseUrl: string, supabaseKey: string) {
    return createClient<Database>(supabaseUrl, supabaseKey)
}

export function createSupabaseServerClient(supabaseUrl: string, supabaseServiceKey: string) {
    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
