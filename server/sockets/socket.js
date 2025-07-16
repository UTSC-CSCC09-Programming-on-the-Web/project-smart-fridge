
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const http = require('http');
const { sessionMiddleware } = require('../middlewares/session-middleware.js');
const sharedSession  = require('express-socket.io-session');

const { pubClient, subClient, connectSocketRedis }
  = require('../redis/redis-socket');   

const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
};

const setupSocket = async(app) => {
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: corsOptions });

  io.use(sharedSession(sessionMiddleware, {
    autoSave: true
  }));

  await connectSocketRedis();
  io.adapter(createAdapter(pubClient, subClient));

  // add authen middleware for socket.io implement later

  io.on('connection', (socket) => {
    console.log('socket connect to', socket.id);   
    console.log('Headers:', socket.handshake.headers);
    const userId = socket.handshake.session?.passport?.user;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room user:${userId}`);
    }else {
      console.log('No user ID found in session');
    }

    socket.on('joinFridgeRoom', (fridgeId) => {
      socket.join(`fridge:${fridgeId}`);
    });

    socket.on('disconnect', () => console.log('socket disconnected', socket.id));
  });

  subClient.subscribe("recipeGenerated", (msg) => {
    const data = JSON.parse(msg);
    const traceId = data.traceId;
    if (!data.userId) {
      console.error("No userId in message data:", data);
      return;
    }
    console.log(`Publishing recipeGenerated to user:${data.userId}`);
    io.to(`user:${data.userId}`).emit("recipeGenerated", traceId);
  });

  return { httpServer, io };
}

module.exports = { setupSocket };
