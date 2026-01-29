
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Only initialize Supabase if both URL and Key are provided.
 * The rest of the application handles the case where 'supabase' is null
 * by falling back to localStorage (Local-Only mode).
 */
export const supabase = (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null;

if (!supabase) {
    console.warn("Supabase credentials (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY) are missing. System running in Local-Only mode with localStorage persistence.");
}
