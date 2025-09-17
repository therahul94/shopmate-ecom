import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
export const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  retryStrategy(times) {
    // reconnect after X ms
    return Math.min(times * 200, 2000);
  },
});
// await redis.set('foo', 'bar');

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("connect", () => {
  console.log("Connected to Upstash Redis");
});