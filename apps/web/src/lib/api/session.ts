export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const STORAGE_KEY = 'edclub:session';

let inMemorySession: SessionTokens | null = null;

const isBrowser = typeof window !== 'undefined';

const parseSession = (value: string | null): SessionTokens | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as SessionTokens;

    if (
      typeof parsed?.accessToken === 'string' &&
      typeof parsed?.refreshToken === 'string' &&
      typeof parsed?.expiresAt === 'number'
    ) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to parse stored session', error);
  }

  return null;
};

export const getStoredSession = (): SessionTokens | null => {
  if (!isBrowser) {
    return inMemorySession;
  }

  if (inMemorySession) {
    return inMemorySession;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  inMemorySession = parseSession(raw);
  return inMemorySession;
};

export const persistSession = (session: SessionTokens | null): void => {
  inMemorySession = session;

  if (!isBrowser) {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = (): void => {
  persistSession(null);
};
