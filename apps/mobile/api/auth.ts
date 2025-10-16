import type { User } from '@supabase/supabase-js';

import { apiRequest, setAuthTokens } from './client';
import type { SessionTokens } from '../lib/auth-storage';

type LoginResponse = {
  user: User;
  session: SessionTokens;
};

type RegisterResponse = {
  user: User | null;
  session: SessionTokens | null;
};

export type ProfileResponse = {
  user: User;
  stats: {
    weeklyProgress: {
      presents: number;
      total: number;
      percent: number;
    };
    badgesEarned: number;
    upcomingEvents: Array<{
      id: string;
      title: string;
      starts_at: string;
      ends_at: string;
      team_id: string | null;
    }>;
  };
};

export async function loginWithPassword(email: string, password: string): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });

  if (!response.session) {
    throw new Error('Sessão inválida recebida do servidor.');
  }

  setAuthTokens(response.session);
  return response;
}

export async function signUpWithPassword(email: string, password: string): Promise<RegisterResponse> {
  const response = await apiRequest<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });

  if (response.session) {
    setAuthTokens(response.session);
  }

  return response;
}

export async function fetchProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/api/auth/profile');
}
