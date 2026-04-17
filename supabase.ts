import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// Build-safe client instantiation
// Note: The app will only work correctly if the real environment variables are set in Vercel.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
