
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const http = require('http');

const { pubClient, subClient, connectSocketRedis }
  = require('../config/redis/redis-socket');

const setupSocket = async(app) => {
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: { origin: '*' } });

  await connectSocketRedis();
  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    console.log('socket connect to', socket.id);

    socket.on('registerUser', userId => {
      socket.join(`user:${userId}`);
    });

    socket.on('joinFridgeRoom', (fridgeId) => {
      socket.join(`fridge:${fridgeId}`);
    });

    socket.on('disconnect', () => console.log('socket disconnected', socket.id));
  });

  return { httpServer, io };
}

module.exports = { setupSocket };
