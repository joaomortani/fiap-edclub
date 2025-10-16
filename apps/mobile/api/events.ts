import type { AttendanceStatus, EventDTO } from '@edclub/shared';

import { apiRequest } from './client';

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

type AttendanceResponse = {
  attendance: {
    id: string;
    eventId: string;
    userId: string;
    status: AttendanceStatus;
    createdAt: string;
  };
};

const mapEvent = (event: EventResponse): EventDTO => ({
  id: event.id,
  teamId: event.teamId ?? '',
  title: event.title,
  startsAt: event.startsAt,
  endsAt: event.endsAt,
});

export async function listEvents(teamId?: string): Promise<EventDTO[]> {
  const search = teamId ? `?teamId=${encodeURIComponent(teamId)}` : '';
  const response = await apiRequest<EventsResponse>(`/api/events${search}`);
  return response.events.map(mapEvent);
}

export async function markAttendance(eventId: string, status: AttendanceStatus): Promise<void> {
  await apiRequest<AttendanceResponse>('/api/attendance', {
    method: 'POST',
    body: { eventId, status },
  });
}

export async function getAttendanceStatus(eventIds: string[]): Promise<Record<string, AttendanceStatus>> {
  if (eventIds.length === 0) {
    return {};
  }

  const response = await apiRequest<AttendanceListResponse>('/api/attendance');
  const statusMap: Record<string, AttendanceStatus> = {};

  for (const attendance of response.attendances) {
    if (eventIds.includes(attendance.eventId)) {
      statusMap[attendance.eventId] = attendance.status;
    }
  }

  return statusMap;
}

export async function listAttendance(): Promise<AttendanceListResponse> {
  return apiRequest<AttendanceListResponse>('/api/attendance');
}
