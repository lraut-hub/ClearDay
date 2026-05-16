
import { createClient } from '@supabase/supabase-js';

// Use placeholders if keys are missing to prevent createClient from throwing
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!(import.meta as any).env.VITE_SUPABASE_URL || !(import.meta as any).env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing. Auth and cloud sync will be disabled.');
}
