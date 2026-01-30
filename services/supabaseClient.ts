
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssgugrjcznwkxmtynwpp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZ3Vncmpjem53a3htdHlud3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNzgxMTUsImV4cCI6MjA4NDY1NDExNX0.BxQK0lXmyhAUzfBIECNHowgxNzrfMGAR19hFahwlTAE';

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
