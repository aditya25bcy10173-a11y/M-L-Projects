import Redis from 'ioredis';

let hasLoggedRedisWarning = false;

// Support full Cloud Redis URL (Railway / Upstash / Render) or host/port fallback
export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      lazyConnect: false,
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      lazyConnect: false,
    });

redis.on('connect', () => console.log('✅ Connected to Redis'));
redis.on('error', (err: any) => {
  if (!hasLoggedRedisWarning) {
    console.warn(`⚠️  Redis broker not found on port ${process.env.REDIS_PORT || '6379'} (${err.code || 'offline'}). Running telemetry in standalone simulation mode.`);
    hasLoggedRedisWarning = true;
  }
});