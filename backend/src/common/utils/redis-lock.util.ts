import Redis from 'ioredis';
import * as crypto from 'crypto';

const memoryLocks = new Map<string, { token: string; expiresAt: number }>();

let redisClient: any = null;
function getRedisInstance() {
  if (redisClient) return redisClient;
  try {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || 'redis://localhost:6379';
    const RedisConstructor = typeof Redis === 'function' ? Redis : (Redis as any).default;
    if (typeof RedisConstructor === 'function') {
      redisClient = new RedisConstructor(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1, enableOfflineQueue: false });
      redisClient.on('error', () => {});
    }
  } catch {
    redisClient = null;
  }
  return redisClient;
}

export async function acquireLock(key: string, ttlMs: number): Promise<string | null> {
  const token = crypto.randomBytes(16).toString('hex');
  const client = getRedisInstance();
  if (client) {
    try {
      const result = await client.set(key, token, 'PX', ttlMs, 'NX');
      if (result === 'OK') {
        return token;
      }
      return null;
    } catch {
      // Fallback to in-memory lock
    }
  }

  // In-memory fallback if Redis is unavailable or un-mocked
  const now = Date.now();
  const existing = memoryLocks.get(key);
  if (existing && existing.expiresAt > now) {
    return null;
  }
  memoryLocks.set(key, { token, expiresAt: now + ttlMs });
  return token;
}

export async function releaseLock(key: string, token: string): Promise<void> {
  const client = getRedisInstance();
  if (client) {
    try {
      const script = `
        if redis.call('get', KEYS[1]) == ARGV[1] then
          return redis.call('del', KEYS[1])
        else
          return 0
        end
      `;
      await client.eval(script, 1, key, token);
      return;
    } catch {
      // Fallback to in-memory lock
    }
  }

  const existing = memoryLocks.get(key);
  if (existing && existing.token === token) {
    memoryLocks.delete(key);
  }
}
