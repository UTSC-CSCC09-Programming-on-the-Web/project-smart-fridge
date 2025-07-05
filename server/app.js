"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require('express-session');
const passport = require('passport');
require('./config/passport.js'); 
const ingredientsRouter = require("./routers/ingredients-router.js");
const authRouter = require('./routers/auth-router.js');
const { sequelize } = require("./db/datasource.js");

const PORT = 3000;
const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(
  session({
    secret: process.env.SECRET_KEY || "test",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");


    app.use('/auth', authRouter);

    // temporary for get image upload working, uploads folder are public as static resources
    // in the future, we will move the images under each fridge's own uploads folder
    // and make the uploads folder private, so that only the fridge owner can access it
    app.use("/uploads", express.static("uploads"));

    app.use("/api/fridges", require("./routers/fridges-router.js"));
    
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
