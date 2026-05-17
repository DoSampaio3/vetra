// Redis mock for local development - replace with real Redis in production
const cacheStore = new Map<string, { value: string; expiresAt: number }>();

export const cache = {
  async get(key: string): Promise<string | null> {
    const item = cacheStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      cacheStore.delete(key);
      return null;
    }
    return item.value;
  },

  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    cacheStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  async del(key: string): Promise<void> {
    cacheStore.delete(key);
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const val = await this.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  },

  async setJSON(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  },
};
