import type { AttendanceStatus, EventDTO } from '@edclub/shared';
import { supabase } from '../supabase';

export type CreateEventInput = Omit<EventDTO, 'id'>;

type EventRow = {
  id: string;
  team_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
};

const EVENTS_TABLE = 'events';

const mapEvent = (row: EventRow): EventDTO => ({
  id: row.id,
  teamId: row.team_id,
  title: row.title,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
});

export async function listEvents(teamId?: string): Promise<EventDTO[]> {
  let query = supabase
    .from(EVENTS_TABLE)
    .select<EventRow>('id, team_id, title, starts_at, ends_at')
    .order('starts_at', { ascending: true });

  if (teamId) {
    query = query.eq('team_id', teamId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapEvent);
}

export async function createEvent(event: CreateEventInput): Promise<EventDTO> {
  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert<EventRow>({
      team_id: event.teamId,
      title: event.title,
      starts_at: event.startsAt,
      ends_at: event.endsAt,
    })
    .select<EventRow>('id, team_id, title, starts_at, ends_at')
    .single();

  if (error || !data) {
    throw error ?? new Error('Evento não pôde ser criado.');
  }

  return mapEvent(data);
}

type AttendanceRow = {
  event_id: string;
  user_id: string;
  status: AttendanceStatus;
};

const EVENT_ATTENDANCE_TABLE = 'attendances';

export async function markAttendance(eventId: string, status: AttendanceStatus): Promise<void> {
  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const userId = userResult?.user?.id;

  if (!userId) {
    throw new Error('Usuário não autenticado.');
  }

  const { error } = await supabase
    .from(EVENT_ATTENDANCE_TABLE)
    .upsert<AttendanceRow>(
      {
        event_id: eventId,
        user_id: userId,
        status,
      },
      { onConflict: 'event_id,user_id' },
    );

  if (error) {
    throw error;
  }
}
