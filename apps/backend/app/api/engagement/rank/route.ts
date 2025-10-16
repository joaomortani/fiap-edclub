import { NextResponse } from 'next/server';

import { requireAuth, toErrorResponse } from '@lib/auth';

type RankRow = {
  user_id: string;
  presents: number | null;
  total: number | null;
  percent: number | null;
};

const toNumber = (value: number | null): number => (typeof value === 'number' ? value : 0);

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAuth(request);

    const { data, error } = await supabase
      .from('weekly_attendance_rank')
      .select('*');

    if (error) {
      throw error;
    }

    const rank = (data ?? []).map((row: RankRow) => ({
      userId: row.user_id,
      presents: toNumber(row.presents),
      total: toNumber(row.total),
      percent: toNumber(row.percent)
    }));

    return NextResponse.json({ rank });
  } catch (error) {
    return toErrorResponse(error);
  }
}
