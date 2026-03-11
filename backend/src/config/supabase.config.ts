import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey);
};

if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️  Supabase not configured - image uploads will be disabled');
}

export const supabase: SupabaseClient | null = isSupabaseConfigured() 
  ? createClient(
      supabaseUrl!,
      supabaseKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

export const testSupabaseConnection = async () => {
  if (!supabase) {
    console.log('⚠️  Supabase not configured');
    return false;
  }
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connected successfully');
    console.log('📦 Available buckets:', data.map(b => b.name).join(', '));
    return true;
  } catch (err: any) {
    console.log('❌ Supabase connection error:', err.message);
    return false;
  }
};