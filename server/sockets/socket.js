const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const http = require("http");
const { sessionMiddleware } = require("../middlewares/session-middleware.js");
const sharedSession = require("express-socket.io-session");
const userFridgeAccessChecker = require("../utils/userfridge-access-checker.js");

const {
  pubClient,
  subClient,
  connectSocketRedis,
} = require("../redis/redis-socket");

const corsOptions = {
  origin: "https://smartfridge.dev",
  credentials: true,
};

let io;

const setupSocket = async (app) => {
  console.log("Setting up set up Socket...");
  const httpServer = http.createServer(app);
  io = new Server(httpServer, { cors: corsOptions });

  io.use(
    sharedSession(sessionMiddleware, {
      autoSave: true,
    })
  );

  io.use((socket, next) => {
  const user = socket.handshake.session?.passport?.user;
  if (!user) {
    return next();
  }
  socket.userId = user;
  next();
});

  await connectSocketRedis();
  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {
    console.log("socket connect to", socket.id);
    const userId = socket.userId;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room user:${userId}`);
    } else {
      console.warn("No user ID found in session");
      return socket.emit("error", "User not authenticated");
    }

    socket.on("joinFridgeRoom", async (fridgeId) => {
      const hasAccess = await userFridgeAccessChecker(userId, fridgeId);
      if (!hasAccess) {
        console.error(
          `User ${userId} does not have access to fridge ${fridgeId}`
        );
        return socket.emit("error", "You do not have access to this fridge");
      }
      console.log(`User ${userId} joining fridge room: fridge:${fridgeId}`);
      socket.join(`fridge:${fridgeId}`);
    });

    socket.on("leaveFridgeRoom", (fridgeId) => {
      console.log(`User ${userId} leaving fridge room: fridge:${fridgeId}`);
      socket.leave(`fridge:${fridgeId}`);
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

    io.to(`user:${data.userId}`).emit("cvTaskProgress", {
      source: "task",
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
      source: "task",
      traceId: traceId,
      result: data.result,
    });
  });
  console.log("Socket.io setup complete");
  return { httpServer, io };
};

const getIO = () => {
  if (!io) {
    console.error("Socket.io not initialized. Call setupSocket first.");
    throw new Error("Socket.io not initialized. Call setupSocket first.");
  }
  return io;
};

module.exports = { setupSocket, getIO };
