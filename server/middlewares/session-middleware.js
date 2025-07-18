
const session = require('express-session');
const redisBullmq = require('../redis/redis-bullmq.js');
const RedisStore = require('connect-redis')(session);

const redisStore = new RedisStore({
  client: redisBullmq,
  prefix: 'session:',
  ttl: 86400, 
});

const sessionMiddleware = session({
  store: redisStore,
  secret: process.env.SECRET_KEY || "test",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  },
});

module.exports = { sessionMiddleware };
