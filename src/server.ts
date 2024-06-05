import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import socketController from "./socket/controller";
import userRoutes from "./dashboard/user/userRoutes";
import transactionRoutes from "./dashboard/transaction/transactionRoutes";
const app = express();

const corsOptions = {
  origin: [
    "*",
    "http://192.168.1.26:5173",
    "http://localhost:5000",
    "http://localhost:3000",
    "https://game-crm-backend-r32s.onrender.com",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
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

//OTHER ROUTES
app.use("/api/users", userRoutes);
app.use("/api/transaction", transactionRoutes);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socketController(io);

export default server;
