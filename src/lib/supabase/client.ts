import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database'

export const createClient = () => {
  console.log('Creating Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Anon key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}