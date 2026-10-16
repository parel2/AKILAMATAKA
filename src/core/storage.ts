const PREFIX = 'milea_';

export const storage = {
  get(key: string): string | null {
    try {
      return sessionStorage.getItem(PREFIX + key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      sessionStorage.setItem(PREFIX + key, value);
    } catch {
      // ignore
    }
  },
  remove(key: string): void {
    try {
      sessionStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },
};
