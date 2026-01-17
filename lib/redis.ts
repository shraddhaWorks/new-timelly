import { Redis } from "@upstash/redis";

// Create Redis client only if credentials are available
let redisClient: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    console.warn("Redis initialization failed, continuing without cache:", error);
  }
} else {
  console.warn("Redis credentials not found, caching disabled");
}

// Export a wrapper that handles missing Redis gracefully
export const redis = {
  async get(key: string) {
    if (!redisClient) return null;
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.warn(`Redis get error for key ${key}:`, error);
      return null;
    }
  },
  async set(key: string, value: any, options?: { ex?: number }) {
    if (!redisClient) return;
    try {
      if (options?.ex) {
        await redisClient.set(key, value, { ex: options.ex });
      } else {
        await redisClient.set(key, value);
      }
    } catch (error) {
      console.warn(`Redis set error for key ${key}:`, error);
    }
  },
  async del(key: string) {
    if (!redisClient) return;
    try {
      await redisClient.del(key);
    } catch (error) {
      console.warn(`Redis del error for key ${key}:`, error);
    }
  },
};