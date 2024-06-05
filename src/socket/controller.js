"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../user/user");
const socketController = (io) => {
    io.use((socket, next) => {
        console.log("I'm Socket middleware");
        next();
    });
    io.on("connection", (socket) => {
        io.emit("newConnectionAlert", "A new user has connected!");
        (0, user_1.initializeUser)(socket);
    });
};
exports.default = socketController;
