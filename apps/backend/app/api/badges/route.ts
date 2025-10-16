import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireTeacherRole, toErrorResponse } from '@lib/auth';

const awardSchema = z.object({
  userId: z.string().uuid(),
  badgeId: z.string().uuid()
});

export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') ?? user.id;

    if (userId !== user.id) {
      requireTeacherRole(user);
    }

    const [{ data: badges, error: badgesError }, { data: assignments, error: assignmentsError }] = await Promise.all([
      supabase.from('badges').select('*').order('name', { ascending: true }),
      supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
    ]);

    if (badgesError) {
      throw badgesError;
    }

    if (assignmentsError) {
      throw assignmentsError;
    }

    const assignmentSet = new Map(assignments?.map((assignment) => [assignment.badge_id, assignment.awarded_at]));

    const merged = (badges ?? []).map((badge) => ({
      ...badge,
      awardedAt: assignmentSet.get(badge.id) ?? null
    }));

    return NextResponse.json({ badges: merged });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireAuth(request);
    requireTeacherRole(user);

    const payload = await request.json();
    const { userId, badgeId } = awardSchema.parse(payload);

    const { data, error } = await supabase
      .from('user_badges')
      .upsert({ user_id: userId, badge_id: badgeId })
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ assignment: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return toErrorResponse(error);
  }
}
