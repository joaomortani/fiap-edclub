import * as SecureStore from 'expo-secure-store';

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const STORAGE_KEY = 'edclub.session';

export async function loadSession(): Promise<SessionTokens | null> {
  try {
    const value = await SecureStore.getItemAsync(STORAGE_KEY);

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value) as SessionTokens;

    if (
      typeof parsed?.accessToken === 'string' &&
      typeof parsed?.refreshToken === 'string' &&
      typeof parsed?.expiresAt === 'number'
    ) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to load stored session', error);
  }

  return null;
}

export async function saveSession(tokens: SessionTokens | null): Promise<void> {
  try {
    if (!tokens) {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      return;
    }

    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.warn('Unable to persist session', error);
  }
}

export async function clearSession(): Promise<void> {
  await saveSession(null);
}
