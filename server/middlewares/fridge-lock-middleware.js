const {
  tryAcquireFridgeLock,
  lockLostHandling,
} = require("../services/fridge-lock-service");
const { getIO } = require("../sockets/socket.js");
const Fridge = require("../models/index.js").Fridge;
const Mutex = require("redis-semaphore").Mutex;
const redisBullmq = require("../redis/redis-bullmq.js");

const tryAcquireFridgeLockMiddleware = async (req, res, next) => {
  const fridgeId = req.fridgeId; // Assuming fridgeId is set by fridgeAuthMiddle
  const fridge = await Fridge.findOne({ where: { id: fridgeId } });
  const io = getIO();
  if (!fridge) {
    return res.status(404).json({ error: "Fridge not found" });
  }
  let lockIdentifier;
  try {
    lockIdentifier = await tryAcquireFridgeLock(fridgeId);
    if (!lockIdentifier) {
      io.to(`user:${req.user.id}`).emit("fridgeLockError", {
        fridgeId,
        message: `Fridge: ${fridge.name} is currently locked, please try again later`,
      });
      return res
        .status(423)
        .json({
          error: `Fridge: ${fridge.name} is currently locked, please try again later`,
        });
    }
    req.fridgeLockIdentifier = lockIdentifier;
    io.to(`fridge:${fridgeId}`).emit("fridgeLockEvent", {
      fridgeId,
      type: "acquired",
      userName: req.user.name,
      message: `User ${req.user.name} is updating the fridge ${fridge.name}, please wait...`,
    });
    console.log(
      `Fridge lock acquired for fridgeId: ${fridgeId} by user: ${req.user.name}`
    );
    return next();
  } catch (error) {
    console.error("Error acquiring fridge lock:", error);
    if (lockIdentifier) {
      io.to(`fridge:${fridgeId}`).emit("fridgeLockEvent", {
        fridgeId,
        type: "error",
        userName: req.user.name,
        message: `User ${req.user.name} failed to update the fridge ${fridge.name} with lock, please wait and try again later.`,
      });
      const mutex = new Mutex(redisBullmq, `fridge:lock:${fridgeId}`, {
        identifier: lockIdentifier,
        acquireAttemptsLimit: 1,
        lockTimeout: 5000, // 5 seconds
        acquiredExternally: true,
        onLockLost: lockLostHandling,
        refreshInterval: 0,
      });
      await mutex.acquire();
      await mutex.release();
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = tryAcquireFridgeLockMiddleware;
