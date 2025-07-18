"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("./config/passport.js");
const ingredientsRouter = require("./routers/ingredients-router.js");
const authRouter = require("./routers/auth-router.js");
const recipeRouter = require("./routers/recipe-router.js");
const { sequelize } = require("./db/datasource.js");
const {
  stripeRouter,
  stripeWebhookRouter,
} = require("./routers/stripe-router.js");

const fridgesRouter = require("./routers/fridges-router.js");
const multiIngredientsRouter = require("./routers/add-multi-ingredients-router.js");

const { setupSocket } = require("./sockets/socket.js");
const { sessionMiddleware } = require("./middlewares/session-middleware.js");
//
const PORT = 3000;
const app = express();
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookRouter
);

app.use(bodyParser.json());

const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    app.use("/auth", authRouter);
    app.use("/api/stripe", stripeRouter);

    // temporary for get image upload working, uploads folder are public as static resources
    // in the future, we will move the images under each fridge's own uploads folder
    // and make the uploads folder private, so that only the fridge owner can access it
    app.use("/uploads", express.static("uploads"));

    app.use("/api/fridges", fridgesRouter);

    // add routers here
    app.use("/api/fridges", ingredientsRouter);
    app.use("/api/ingredients", ingredientsRouter);
    app.use("/api/recipes", recipeRouter);
    app.use("/api/fridges", multiIngredientsRouter);

    app.get("/", (req, res) => {
      res.send("Backend root route: server is running.");
    });

    const { httpServer, io } = await setupSocket(app);
    app.set("io", io);
    app.set("httpServer", httpServer);

    httpServer.listen(PORT, () => {
      console.log(`HTTP server on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

startServer();
