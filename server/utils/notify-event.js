"use strict";
const { getIO } = require("../sockets/socket.js");

const notifyFridgeUpdateEvent = (
  userId,
  fridgeId,
  type,
  operation,
  optional = {}
) => {
  const io = getIO();
  io.to(`user:${userId}`).emit("fridgeUpdatedToUser", {
    fridgeId,
    type,
    source: "user",
    operation,
    ...optional,
  });
  io.to(`fridge:${fridgeId}`).emit("fridgeUpdated", {
    userId,
    fridgeId,
    type,
    source: "fridge",
    operation,
    ...optional,
  });
  io.to(`fridge:${fridgeId}`).emit("fridgeLockEvent", {
    userId,
    fridgeId,
    type: "info",
    source: "lock",
    lock: false,
  });
};

const notifyFridgeJoinEvent = (userId, userName, fridgeId) => {
  const io = getIO();
  io.to(`fridge:${fridgeId}`).emit("userJoinedFridge", { userId, userName, fridgeId, type: "info", source: "fridge" });
};

module.exports = {
  notifyFridgeUpdateEvent,
  notifyFridgeJoinEvent
};