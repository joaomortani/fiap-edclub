import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getEnv } from './env';

export type ServiceSupabaseClient = SupabaseClient<Database>;

export function createServiceClient(): ServiceSupabaseClient {
  const env = getEnv();

  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function createPublicClient(): SupabaseClient<Database> {
  const env = getEnv();

  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
