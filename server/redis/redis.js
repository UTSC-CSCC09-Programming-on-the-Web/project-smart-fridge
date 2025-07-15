
const Redis = require("ioredis");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

const redis = new Redis(redisUrl);

redis.on("connect", () => {
  console.log("[Redis] Connected to", redisUrl);
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err);
});

module.exports = redis;