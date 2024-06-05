import { Socket } from "socket.io";
import { MESSAGEID, MESSAGETYPE } from "../utils/utils";
import { gameSettings } from "../game/global";
import { CheckResult } from "../game/slotResults";
import { getRTP } from "../game/rtpgenerator";

export let users: Map<string, User> = new Map();

export class User {
  socket: Socket;
  isAlive: boolean = false;

  constructor(socket: Socket) {
    this.isAlive = true;
    this.socket = socket;
    console.log("Client if from users:", socket.id);

    socket.on("pong", this.heartbeat);
    socket.on("message", this.messageHandler());
    socket.on("disconnect", () => this.deleteUserFromMap());
  }

  sendError(errorCode: string, message: any) {
    const params = {
      errorCode: errorCode,
      message: message,
    };
    this.socket.emit(MESSAGETYPE.ERROR, params);
  }

  sendAlert(message: string) {
    this.socket.emit(MESSAGETYPE.ALERT, message);
  }

  sendMessage(id: string, message: any) {
    this.socket.emit(MESSAGETYPE.MESSAGE, { id, message });
  }

  heartbeat = () => {
    this.isAlive = true;
  };

  messageHandler = () => {
    return (message: any) => {
      const messageData = JSON.parse(message);

      if (messageData.id == MESSAGEID.AUTH) {
        console.log("AUTH : ", messageData);
        gameSettings.initiate(messageData.data.gameID, this.socket.id);
      }

      if (messageData.id === MESSAGEID.SPIN && gameSettings.startGame) {
        gameSettings.currentBet = messageData.data.currentBet;
        new CheckResult(this.socket.id);
      }
      if (messageData.id == MESSAGEID.GENRTP) {
        gameSettings.currentBet = messageData.data.currentBet;
        getRTP(this.socket.id, messageData.data.spins);
      }

      if (messageData.id === MESSAGEID.GAMBLE) {
      }
    };
  };

  deleteUserFromMap = () => {
    // Attempt to delete the user from the map
    const clientID = this.socket.id;

    if (getClient(clientID)) {
      users.delete(clientID);
      console.log(`User with ID ${clientID} was successfully removed.`);
    } else {
      console.log(`No user found with ID ${clientID}.`);
    }
  };
}

export function initializeUser(socket: Socket) {
  const user = new User(socket);
  users.set(user.socket.id, user);
}

export function getClient(clientId: string) {
  const user = users.get(clientId);
  return user;
}
