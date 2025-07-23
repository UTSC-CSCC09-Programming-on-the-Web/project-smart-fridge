const redisBullmq = require("../redis/redis-bullmq");
const Mutex = require("redis-semaphore").Mutex;

const tryAcquireFridgeLock = async (fridgeId) => {
  if (!fridgeId) {
    console.error("[Fridge Lock] No fridge ID provided");
    return null;
  }
  const mutex = new Mutex(redisBullmq, `fridge:lock:${fridgeId}`, {
    acquireAttemptsLimit: 1,
    lockTimeout: 60000, // 60 seconds
    onLockLost: lockLostHandling,
    refreshInterval: 0, // Disable auto-refresh
  });
  const lockAcquire = await mutex.tryAcquire();
  if (!lockAcquire) return null;
  console.log(
    "[fridge lock service] Acquired lock for fridge with identifier:",
    mutex.identifier
  );
  return mutex.identifier;
};

const lockLostHandling = (err) => {
  console.warn("[Fridge Lock] Lock lost:", err);
};

const ingredientMutex = (fridgeId, lockIdentifier) => {
  if (!fridgeId || !lockIdentifier) {
    console.error("[Fridge Lock] Invalid fridge ID or lock identifier");
    return null;
  }
  return new Mutex(redisBullmq, `fridge:lock:${fridgeId}`, {
    identifier: lockIdentifier,
    acquireAttemptsLimit: 1,
    lockTimeout: 60000, // 60 seconds
    acquiredExternally: true,
    onLockLost: lockLostHandling,
    refreshInterval: 0, // Disable auto-refresh
  });
};

module.exports = {
  tryAcquireFridgeLock,
  lockLostHandling,
  ingredientMutex,
};
