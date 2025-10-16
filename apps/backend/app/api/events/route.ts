import { NextResponse } from 'next/server';
import { requireAuth, toErrorResponse } from '@lib/auth';

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAuth(request);

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('starts_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ events: data ?? [] });
  } catch (error) {
    return toErrorResponse(error);
  }
}
