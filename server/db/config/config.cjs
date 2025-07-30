"use strict";
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
  },
};
