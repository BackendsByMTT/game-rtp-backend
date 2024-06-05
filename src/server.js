"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const controller_1 = __importDefault(require("./socket/controller"));
const userRoutes_1 = __importDefault(require("./dashboard/user/userRoutes"));
const transactionRoutes_1 = __importDefault(require("./dashboard/transaction/transactionRoutes"));
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
const server = (0, http_1.createServer)(app);
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
app.use("/api/users", userRoutes_1.default);
app.use("/api/transaction", transactionRoutes_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
(0, controller_1.default)(io);
exports.default = server;
