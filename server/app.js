import { sequelize } from "./datasource.js";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const PORT = 3000;
export const app = express();
app.use(bodyParser.json());


const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
};
app.use(cors(corsOptions));

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}



app.get("/", (req, res) => {
  res.send("Backend root route: server is running.");
});

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
