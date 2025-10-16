import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServiceClient } from './supabase';

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export type AuthContext = {
  user: User;
  supabase: ReturnType<typeof createServiceClient>;
  accessToken: string;
};

function extractToken(request: Request): string {
  const header = request.headers.get('authorization');

  if (!header) {
    throw new HttpError('Missing Authorization header', 401);
  }

  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new HttpError('Authorization header must be a Bearer token', 401);
  }

  return token;
}

export async function requireAuth(request: Request): Promise<AuthContext> {
  const accessToken = extractToken(request);
  const supabase = createServiceClient();

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    throw new HttpError('Invalid or expired access token', 401);
  }

  return { user: data.user, supabase, accessToken };
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
}

export function requireTeacherRole(user: AuthContext['user']): void {
  const role =
    (typeof user.app_metadata?.role === 'string' && user.app_metadata.role) ||
    (typeof user.user_metadata?.role === 'string' && user.user_metadata.role);

  if (role !== 'teacher') {
    throw new HttpError('Only teachers can perform this action', 403);
  }
}
