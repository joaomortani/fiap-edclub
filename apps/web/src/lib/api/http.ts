import { clearSession, getStoredSession } from './session';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!API_BASE_URL) {
  console.warn('NEXT_PUBLIC_BACKEND_URL is not defined. API calls will fail.');
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: HeadersInit;
  auth?: boolean;
};

const buildHeaders = (options: RequestOptions): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  if (options.auth !== false) {
    const session = getStoredSession();

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }

  return headers;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Backend URL is not configured.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: buildHeaders(options),
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'omit'
  });

  if (response.status === 401) {
    clearSession();
  }

  if (!response.ok) {
    let message = 'Request failed.';

    try {
      const payload = await response.json();
      message = payload?.error ?? message;
    } catch (error) {
      console.warn('Unable to parse error response', error);
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
