const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

type RequestOptions = RequestInit & { expectJson?: boolean };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { expectJson = true, headers, ...init } = options;
  const baseHeaders = init.body ? { 'Content-Type': 'application/json' } : undefined;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(baseHeaders ?? {}),
      ...(headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = 'Não foi possível concluir a solicitação.';

    try {
      const errorBody = await response.json();
      if (errorBody?.message) {
        message = String(errorBody.message);
      } else if (errorBody?.error) {
        message = String(errorBody.error);
      }
    } catch (error) {
      // Ignored: fallback to default message
    }

    throw new Error(message);
  }

  if (!expectJson || response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type EventDTO = {
  id: string;
  teamId: string;
  title: string;
  startsAt: string;
  endsAt: string;
};

export type BadgeDTO = {
  id: string;
  userId: string;
  name: string;
  description: string;
  iconUrl: string | null;
  earnedAt: string;
};

export type PostDTO = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};

export async function listEvents(): Promise<EventDTO[]> {
  return request<EventDTO[]>('/events');
}

export async function listTodayEvents(): Promise<EventDTO[]> {
  return request<EventDTO[]>('/events/today');
}

export async function markPresence(eventId: string): Promise<void> {
  await request<void>(`/events/${eventId}/attendance`, {
    method: 'POST',
    body: JSON.stringify({ status: 'present' }),
    expectJson: false,
  });
}

export async function listBadges(): Promise<BadgeDTO[]> {
  return request<BadgeDTO[]>('/badges');
}

export async function listPosts(): Promise<PostDTO[]> {
  return request<PostDTO[]>('/posts');
}

export async function createPost(content: string): Promise<PostDTO> {
  return request<PostDTO>('/posts', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
