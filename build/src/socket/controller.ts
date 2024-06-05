import { initializeUser } from "../user/user";

const socketController = (io) => {
  io.use((socket, next) => {
    console.log("I'm Socket middleware");
    next();
  });

  io.on("connection", (socket) => {
    io.emit("newConnectionAlert", "A new user has connected!");
    initializeUser(socket);
  });
};

export default socketController;
