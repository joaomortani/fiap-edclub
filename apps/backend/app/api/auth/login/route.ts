import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createPublicClient } from '@lib/supabase';
import { toErrorResponse } from '@lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { email, password } = loginSchema.parse(payload);

    const supabase = createPublicClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message ?? 'Unable to authenticate' }, { status: 401 });
    }

    return NextResponse.json({
      user: data.user,
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return toErrorResponse(error);
  }
}
