import { NextResponse } from 'next/server';
import { requireAuth, toErrorResponse } from '@lib/auth';

export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireAuth(request);

    const [{ data: progressData }, { data: badgeAssignments }, { data: upcomingEvents }] = await Promise.all([
      supabase.rpc('get_weekly_progress', { uid: user.id }),
      supabase
        .from('user_badges')
        .select('badge_id, awarded_at')
        .eq('user_id', user.id),
      supabase
        .from('events')
        .select('*')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(5)
    ]);

    const progress = progressData?.[0] ?? { presents: 0, total: 0, percent: 0 };

    return NextResponse.json({
      user,
      stats: {
        weeklyProgress: {
          presents: progress.presents ?? 0,
          total: progress.total ?? 0,
          percent: progress.percent ?? 0
        },
        badgesEarned: badgeAssignments?.length ?? 0,
        upcomingEvents: upcomingEvents ?? []
      }
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
