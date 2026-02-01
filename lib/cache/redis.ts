// Redis cache utilities
// For now, using in-memory cache. Replace with Redis in production

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data: value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new InMemoryCache();

// Cache keys
export const CacheKeys = {
  userProfile: (userId: string) => `user:profile:${userId}`,
  companyInfo: (company: string) => `company:info:${company}`,
  materialContent: (materialId: string) => `material:content:${materialId}`,
  jobPosting: (jobId: string) => `job:posting:${jobId}`,
};
