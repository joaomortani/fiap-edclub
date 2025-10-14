import type { AuthResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export async function loginMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    throw error;
  }
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthResponse['data']> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return data;
}
