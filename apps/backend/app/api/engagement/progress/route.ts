import { NextResponse } from 'next/server';

import { requireAuth, toErrorResponse } from '@lib/auth';

export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireAuth(request);

    const { data, error } = await supabase.rpc('get_weekly_progress', { uid: user.id });

    if (error) {
      throw error;
    }

    const [row] = data ?? [];

    return NextResponse.json({
      progress: {
        presents: Number(row?.presents ?? 0),
        total: Number(row?.total ?? 0),
        percent: Number(row?.percent ?? 0)
      }
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
