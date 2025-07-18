// server/redis/redis-bullmq.js
const Redis = require("ioredis");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

const redisBullmq = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

redisBullmq.on("connect", () => {
  console.log("[Redis] Connected to", redisUrl);
});

redisBullmq.on("error", (err) => {
  console.error("[Redis] Connection error:", err);
});

module.exports = redisBullmq;
