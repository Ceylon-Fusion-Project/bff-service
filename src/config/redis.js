const Redis = require("ioredis");
const session = require("express-session");
const RedisStore = require("connect-redis").RedisStore;

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", function (err) {
  console.error("ioredis Error:", err);
});

const sessionStore = new RedisStore({
  client: redisClient,
  disableTouch: true,
  ttl: 86400, 
});

module.exports = { redisClient, sessionStore };
