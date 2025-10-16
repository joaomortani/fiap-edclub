import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, toErrorResponse } from '@lib/auth';

const attendanceSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(['present', 'absent', 'late'])
});

export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    let query = supabase
      .from('attendances')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const { data: progress } = await supabase.rpc('get_weekly_progress', { uid: user.id });

    return NextResponse.json({
      attendances: data ?? [],
      weeklyProgress: progress?.[0] ?? { presents: 0, total: 0, percent: 0 }
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireAuth(request);
    const payload = await request.json();
    const { eventId, status } = attendanceSchema.parse(payload);

    const existing = await supabase
      .from('attendances')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (existing.error) {
      throw existing.error;
    }

    if (existing.data) {
      const { data, error } = await supabase
        .from('attendances')
        .update({ status })
        .eq('id', existing.data.id)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      return NextResponse.json({ attendance: data });
    }

    const { data, error } = await supabase
      .from('attendances')
      .insert({
        user_id: user.id,
        event_id: eventId,
        status
      })
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ attendance: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return toErrorResponse(error);
  }
}
