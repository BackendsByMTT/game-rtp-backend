import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import socketController from "./socket/controller";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
const server = createServer(app);
// HEALTH ROUTES
app.get("/", (req, res, next) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date().toLocaleDateString(),
  };
  res.status(200).json(health);
});
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socketController(io);

export default server;
