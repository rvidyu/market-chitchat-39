
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// For development fallback to allow testing without real Supabase credentials
const isUsingMockCredentials = supabaseUrl === 'https://example.supabase.co' || 
                               supabaseAnonKey === 'your-anon-key';

if (isUsingMockCredentials) {
  console.warn('Using mock Supabase credentials. Auth and database operations will fall back to local storage.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const usingMockSupabase = isUsingMockCredentials;
