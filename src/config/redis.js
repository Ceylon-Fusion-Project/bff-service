const Redis = require("ioredis");
const session = require("express-session");
const RedisStore = require("connect-redis").RedisStore;

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff for reconnect
  reconnectOnError: (err) => {
    console.error("Redis Reconnect Error:", err.message);
    return true; // Force reconnect on error
  },
  lazyConnect: false, // Ensure Redis connects immediately
});

redisClient.on("Redis error", (err) => console.error("ioredis Error:", err));
redisClient.on("connect", () => console.log("Redis connected successfully"));
redisClient.on("ready", () => console.log("Redis is ready to use"));
redisClient.on("reconnecting", () => console.log("Reconnecting to Redis..."));
redisClient.on("end", () => console.warn("Redis connection closed"));


const sessionStore = new RedisStore({
  client: redisClient,
  disableTouch: false,
  ttl: 86400, 
});

module.exports = { redisClient, sessionStore };
