
require('dotenv').config();
const { sequelize, LlmTask } = require("../models");
const { pubClient } = require('../redis/redis-socket');

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Worker: DB Connected");

    if (!pubClient.isOpen) {
      await pubClient.connect();
    }

    require("./llm-recipe-worker");

  } catch (err) {
    console.error("Worker: DB connection error", err);
    process.exit(1);
  }
})();
