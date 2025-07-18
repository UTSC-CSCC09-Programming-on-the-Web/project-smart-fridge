const { createClient } = require("redis");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

const pubClient = createClient(redisUrl);
const subClient = pubClient.duplicate();

async function connectSocketRedis() {
  await pubClient.connect();
  await subClient.connect();
}

module.exports = {
  pubClient,
  subClient,
  connectSocketRedis,
};
