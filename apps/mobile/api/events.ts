import type { AttendanceStatus, EventDTO } from '@edclub/shared';
import { supabase } from '../lib/supabase';

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
    .select('id, team_id, title, starts_at, ends_at')
    .order('starts_at', { ascending: true });

  if (teamId) {
    query = query.eq('team_id', teamId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as EventRow[];

  return rows.map(mapEvent);
}

export async function createEvent(event: CreateEventInput): Promise<EventDTO> {
  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      team_id: event.teamId,
      title: event.title,
      starts_at: event.startsAt,
      ends_at: event.endsAt,
    })
    .select('id, team_id, title, starts_at, ends_at')
    .single();

  if (error || !data) {
    throw error ?? new Error('Evento não pôde ser criado.');
  }

  return mapEvent(data as EventRow);
}

type AttendanceRow = {
  event_id: string;
  user_id: string;
  status: AttendanceStatus;
};

const EVENT_ATTENDANCE_TABLE = 'event_attendance';

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
    .upsert(
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

type AttendanceStatusRow = {
  event_id: string;
  status: AttendanceStatus;
};

export async function getAttendanceStatus(
  eventIds: string[],
): Promise<Record<string, AttendanceStatus>> {
  if (eventIds.length === 0) {
    return {};
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const userId = userResult?.user?.id;

  if (!userId) {
    return {};
  }

  const { data, error } = await supabase
    .from(EVENT_ATTENDANCE_TABLE)
    .select('event_id, status')
    .eq('user_id', userId)
    .in('event_id', eventIds);

  if (error) {
    throw error;
  }

  const statusMap: Record<string, AttendanceStatus> = {};

  const rows = (data ?? []) as AttendanceStatusRow[];

  for (const row of rows) {
    if (row.event_id && row.status) {
      statusMap[row.event_id] = row.status;
    }
  }

  return statusMap;
}
