import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy-init to avoid crashing at import time when env vars are missing (e.g. during build)
let _supabase: SupabaseClient | null = null;
export const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase env vars.");
  if (!_supabase) _supabase = createClient(supabaseUrl, supabaseKey);
  return _supabase;
};

// Client for backend admin (sync jobs) - requires SERVICE_ROLE_KEY
// Use this only in API routes/Server Actions
export const getAdminClient = () => {
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for admin operations.");
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
