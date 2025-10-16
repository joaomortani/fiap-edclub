import type { AttendanceStatus, EventDTO } from '@edclub/shared';

import { apiRequest } from './http';

type EventResponse = {
  id: string;
  teamId: string | null;
  title: string;
  startsAt: string;
  endsAt: string;
};

type EventsResponse = {
  events: EventResponse[];
};

type CreateEventInput = {
  teamId: string;
  title: string;
  startsAt: string;
  endsAt: string;
};

type CreateEventResponse = {
  event: EventResponse;
};

type AttendanceResponse = {
  attendance: {
    id: string;
    eventId: string;
    userId: string;
    status: AttendanceStatus;
    createdAt: string;
  };
};

type AttendanceListResponse = {
  attendances: Array<{
    id: string;
    eventId: string;
    userId: string;
    status: AttendanceStatus;
    createdAt: string;
  }>;
  weeklyProgress: {
    presents: number;
    total: number;
    percent: number;
  };
};

const mapEvent = (event: EventResponse): EventDTO => ({
  id: event.id,
  teamId: event.teamId ?? '',
  title: event.title,
  startsAt: event.startsAt,
  endsAt: event.endsAt
});

export async function listEvents(teamId?: string): Promise<EventDTO[]> {
  const search = teamId ? `?teamId=${encodeURIComponent(teamId)}` : '';
  const response = await apiRequest<EventsResponse>(`/api/events${search}`);
  return response.events.map(mapEvent);
}

export async function createEvent(event: CreateEventInput): Promise<EventDTO> {
  const response = await apiRequest<CreateEventResponse>('/api/events', {
    method: 'POST',
    body: event
  });

  return mapEvent(response.event);
}

export async function listAttendance(eventId?: string): Promise<AttendanceListResponse> {
  const path = eventId ? `/api/attendance?eventId=${encodeURIComponent(eventId)}` : '/api/attendance';
  return apiRequest<AttendanceListResponse>(path);
}

export async function markAttendance(eventId: string, status: AttendanceStatus): Promise<AttendanceResponse> {
  return apiRequest<AttendanceResponse>('/api/attendance', {
    method: 'POST',
    body: { eventId, status }
  });
}
