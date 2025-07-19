const { createClient } = require("redis");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

async function connectSocketRedis() {
  console.log("Connecting to Redis at", redisUrl);
  console.log("debug pubClient", pubClient.options.host, pubClient.options.port);
  await pubClient.connect();
  await subClient.connect();
}

module.exports = {
  pubClient,
  subClient,
  connectSocketRedis,
};
