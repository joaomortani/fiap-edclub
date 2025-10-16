import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, toErrorResponse } from '@lib/auth';

const postSchema = z.object({
  content: z.string().min(1).max(500)
});

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAuth(request);

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({ posts: data ?? [] });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireAuth(request);
    const payload = await request.json();
    const { content } = postSchema.parse(payload);

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content
      })
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return toErrorResponse(error);
  }
}
