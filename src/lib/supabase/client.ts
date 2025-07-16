import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase credentials not configured - using fallback')
    }
    // Use placeholder credentials for build-time safety
    return createBrowserClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }
  
  return createBrowserClient<Database>(url, key)
}