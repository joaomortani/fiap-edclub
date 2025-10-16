import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireTeacherRole, toErrorResponse } from '@lib/auth';

const eventSchema = z.object({
  teamId: z.string().uuid(),
  title: z.string().min(1),
  startsAt: z.string(),
  endsAt: z.string()
});

const mapEvent = (row: { id: string; team_id: string | null; title: string; starts_at: string; ends_at: string }) => ({
  id: row.id,
  teamId: row.team_id,
  title: row.title,
  startsAt: row.starts_at,
  endsAt: row.ends_at
});

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    let query = supabase
      .from('events')
      .select('*')
      .order('starts_at', { ascending: true });

    if (teamId) {
      query = query.eq('team_id', teamId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const events = (data ?? []).map(mapEvent);

    return NextResponse.json({ events });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireAuth(request);
    requireTeacherRole(user);

    const payload = await request.json();
    const { teamId, title, startsAt, endsAt } = eventSchema.parse(payload);

    const { data, error } = await supabase
      .from('events')
      .insert({
        team_id: teamId,
        title,
        starts_at: startsAt,
        ends_at: endsAt
      })
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Event could not be created');
    }

    return NextResponse.json({ event: mapEvent(data) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return toErrorResponse(error);
  }
}
