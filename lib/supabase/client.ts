import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) && !supabaseUrl.includes('placeholder');

const real = supabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!real) {
      throw new Error('ThatJob is not ready. NEXT_PUBLIC_SUPABASE_URL is missing, so this action cannot run.');
    }
    const value = (real as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
