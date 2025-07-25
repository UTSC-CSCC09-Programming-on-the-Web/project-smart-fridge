"use strict";
const { getIO } = require("../sockets/socket.js");


const notifyFridgeUpdateEvent = (userId, fridgeId, type, operation, optional = {}) => {
  const io = getIO();
  io.to(`user:${userId}`).emit("fridgeUpdatedToUser", { type, source: "user", operation, ...optional });
  io.to(`fridge:${fridgeId}`).emit("fridgeUpdated", { fridgeId, type, source: "fridge", operation, ...optional });
};

module.exports = {
  notifyFridgeUpdateEvent
};