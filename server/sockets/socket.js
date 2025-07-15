
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const http = require('http');

const { pubClient, subClient, connectSocketRedis }
  = require('../redis/redis-socket');   

const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
};

const setupSocket = async(app) => {
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: corsOptions });

  await connectSocketRedis();
  io.adapter(createAdapter(pubClient, subClient));

  // add authen middleware for socket.io implement later

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

  subClient.subscribe("recipeGenerated", (msg) => {
    const data = JSON.parse(msg);
    const traceId = data.traceId;
    io.emit("recipeGenerated", traceId);
  });

  return { httpServer, io };
}

module.exports = { setupSocket };
