"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ingredientsRouter = require("./routers/ingredients-router.js");
const { sequelize } = require("./datasource.js");

const PORT = 3000;
const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
};
app.use(cors(corsOptions));

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // add routers here
    app.use("/api/ingredients", ingredientsRouter);

    app.get("/", (req, res) => {
      res.send("Backend root route: server is running.");
    });

    app.listen(PORT, () => {
      console.log(`HTTP server on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

startServer();
