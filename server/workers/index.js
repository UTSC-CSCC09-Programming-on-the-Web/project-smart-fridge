
require('dotenv').config();
const { sequelize, LlmTask } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Worker: DB Connected");

    require("./llm-recipe-worker");

  } catch (err) {
    console.error("Worker: DB connection error", err);
    process.exit(1);
  }
})();
