
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Initialize Supabase.
 * STRICT MODE: Local storage fallback is DISABLED.
 * The application MUST have valid Supabase credentials to function.
 */
export const supabase = (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: sessionStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }) 
    : null;

if (!supabase) {
    const msg = "FATAL: Supabase credentials missing. Local storage is disabled. Application cannot function without backend connection.";
    console.error(msg);
    // Throwing here might stop execution immediately
    throw new Error(msg);
}
