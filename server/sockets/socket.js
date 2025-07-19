const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const http = require("http");
const { sessionMiddleware } = require("../middlewares/session-middleware.js");
const sharedSession = require("express-socket.io-session");

const {
  pubClient,
  subClient,
  connectSocketRedis,
} = require("../redis/redis-socket");

const corsOptions = {
  origin: "https://jieying.live",
  credentials: true,
};

const setupSocket = async (app) => {
  console.log("Setting up set up Socket...");
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: corsOptions });

  io.use(
    sharedSession(sessionMiddleware, {
      autoSave: true,
    })
  );

  await connectSocketRedis();
  io.adapter(createAdapter(pubClient, subClient));

  // add authen middleware for socket.io implement later
  console.log("Socket.io connected to Redis");
  
  io.on("connection", (socket) => {
    console.log("socket connect to", socket.id);
    console.log("Headers:", socket.handshake.headers);
    const userId = socket.handshake.session?.passport?.user;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room user:${userId}`);
    } else {
      console.log("No user ID found in session");
    }

    socket.on("joinFridgeRoom", (fridgeId) => {
      socket.join(`fridge:${fridgeId}`);
    });

    socket.on("disconnect", () =>
      console.log("socket disconnected", socket.id)
    );
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

  subClient.subscribe("cvTaskProgress", (msg) => {
    const data = JSON.parse(msg);
    const message = data.message;
    if (!data.userId) {
      console.log("No userId in message data:", data);
      return;
    }
    console.log(
      `Publishing cvTaskProgress to user:${data.userId} with message: ${message}`
    );
    // change to emit to fridge room later implement

    io.to(`user:${data.userId}`).emit("cvTaskProgress", {
      message: message,
      type: data?.type || "info",
    });
  });

  subClient.subscribe("addMultiIngredientsFinished", (msg) => {
    const data = JSON.parse(msg);
    const traceId = data.traceId;
    if (!data.userId) {
      console.error("No userId in message data:", data);
      return;
    }
    console.log(
      `Publishing addMultiIngredientsFinished to user:${data.userId}`
    );
    io.to(`user:${data.userId}`).emit("addMultiIngredientsFinished", {
      traceId: traceId,
      result: data.result,
    });
  });
  console.log("Socket.io setup complete");
  return { httpServer, io };
};

module.exports = { setupSocket };
