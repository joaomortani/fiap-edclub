import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createPublicClient } from '@lib/supabase';
import { toErrorResponse } from '@lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { email, password } = registerSchema.parse(payload);

    const supabase = createPublicClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      user: data.user,
      session: data.session
        ? {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at
          }
        : null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return toErrorResponse(error);
  }
}
