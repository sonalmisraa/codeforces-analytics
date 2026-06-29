import NodeCache from 'node-cache';
import logger from './logger';

const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300', 10); // 5 minutes default

const cache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: 60,
  useClones: false,
});

cache.on('expired', (key: string) => {
  logger.debug(`Cache expired: ${key}`);
});

/**
 * Get a value from cache
 */
export function getCache<T>(key: string): T | undefined {
  const value = cache.get<T>(key);
  if (value !== undefined) {
    logger.debug(`Cache hit: ${key}`);
  }
  return value;
}

/**
 * Set a value in cache
 */
export function setCache<T>(key: string, value: T, ttl?: number): boolean {
  logger.debug(`Cache set: ${key} (TTL: ${ttl ?? CACHE_TTL}s)`);
  return ttl !== undefined ? cache.set(key, value, ttl) : cache.set(key, value);
}

/**
 * Delete a cache entry
 */
export function deleteCache(key: string): number {
  return cache.del(key);
}

/**
 * Delete all cache entries matching a pattern prefix
 */
export function deleteCachePattern(prefix: string): void {
  const keys = cache.keys().filter((k) => k.startsWith(prefix));
  keys.forEach((k) => cache.del(k));
  logger.debug(`Cache cleared pattern: ${prefix} (${keys.length} keys)`);
}

/**
 * Cache keys factory
 */
export const CacheKeys = {
  userProfile: (userId: string) => `profile:${userId}`,
  dashboardStats: (userId: string) => `dashboard:${userId}`,
  contestHistory: (userId: string, page: number) => `contests:${userId}:${page}`,
  cfUser: (handle: string) => `cf:user:${handle}`,
  cfRatings: (handle: string) => `cf:ratings:${handle}`,
  cfSubmissions: (handle: string) => `cf:submissions:${handle}`,
  lcStats: (username: string) => `lc:stats:${username}`,
  leaderboard: (page: number) => `leaderboard:${page}`,
  insights: (userId: string) => `insights:${userId}`,
};

export default cache;
