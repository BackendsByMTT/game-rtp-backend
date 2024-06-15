import { Socket } from "socket.io";
import { MESSAGEID, MESSAGETYPE } from "../utils/utils";
import { gameSettings, gameWining, playerData } from "../game/global";
import { CheckResult } from "../game/slotResults";
import { getRTP } from "../game/rtpgenerator";
import { verifySocketToken } from "../utils/playerAuth";
import User from "../dashboard/user/userModel";
import Transaction from "../dashboard/transaction/transactionModel";
import { GambleGame } from "../game/gambleResults";
export let users: Map<string, SocketUser> = new Map();

export class SocketUser {
  socket: Socket;
  isAlive: boolean = false;
  username: string;
  designation: string;
  constructor(socket: Socket) {
    this.isAlive = true;
    this.socket = socket;
    this.username = socket?.data?.username;
    this.designation = socket?.data?.designation;
    // console.log(
    //   "Client if from users:",
    //   socket.id,
    //   this.username,
    //   this.designation
    // );
    socket.on("pong", this.heartbeat);
    socket.on("message", this.messageHandler());
    socket.on(MESSAGEID.AUTH, this.handleAuth);
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
    this.socket.emit(MESSAGETYPE.MESSAGE, JSON.stringify({ id, message }));
  }

  heartbeat = () => {
    this.isAlive = true;
  };

  messageHandler = () => {
    return (message: any) => {
      const messageData = JSON.parse(message);

      if (messageData.id === MESSAGEID.SPIN && gameSettings.startGame) {
        gameSettings.currentBet = messageData.data.currentBet;
        new CheckResult(this.socket.id);
      }
      if (messageData.id == MESSAGEID.GENRTP) {
        gameSettings.currentBet = messageData.data.currentBet;
        getRTP(this.socket.id, messageData.data.spins);
      }

      if (messageData.id === MESSAGEID.GAMBLE) {
        console.log("message data", messageData);
        if (!gameSettings.currentGamedata.gamble.isEnabled) return;

        if (playerData.currentWining > 1) {
          gameSettings.gamble.start = true;
        } else {
          gameSettings.gamble.start = false;
        }

        console.log("gamblestart", gameSettings.gamble.start);

        if (gameSettings.gamble.start) {
          if (!gameSettings.gamble.game)
            gameSettings.gamble.game = new GambleGame(
              this.socket.id,
              playerData.currentWining
            );

          if (!getClient(this.socket.id))
            gameSettings.gamble.game = new GambleGame(
              this.socket.id,
              playerData.currentWining
            );

          if (messageData?.collect) {
            gameSettings.gamble.game.updateplayerBalance();
            gameSettings.gamble.game.reset();
            return;
          }

          // if(gameSettings.gamble.game.gambleCount<gameSettings.gamble.maxCount){
          gameSettings.gamble.game.generateData(playerData.currentWining);

          // }else{
          //     gameSettings.gamble.game.updateplayerBalance();
          //     gameSettings.gamble.game.reset();
          // }

          // gameSettings.gamble.currentCount++;
          console.log("player balance After Gamble Game", playerData);
        }
      }
    };
  };

  //to get the player initial balance after socket connection
  handleAuth = async (message: any) => {
    try {
      const messageData = JSON.parse(message);
      gameSettings.initiate(messageData.Data.GameID, this.socket.id);
      const CurrentUser = await User.findOne({
        username: this.username,
      }).exec();
      if (CurrentUser) {
        playerData.Balance = CurrentUser.credits;
        console.log("Player Balance", CurrentUser.credits);
        this.sendMessage(MESSAGEID.AUTH, CurrentUser.credits);
      } else {
        this.sendError("USER_NOT_FOUND", "User not found in the database");
      }
    } catch (error) {
      console.error("Error handling AUTH message:", error);
      this.sendError("AUTH_ERROR", "An error occurred during authentication");
    }
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

  //Update player credits case win ,bet,and lose;
  async updateCreditsInDb(finalBalance: number) {
    await User.findOneAndUpdate(
      { username: this.username },
      {
        credits: finalBalance,
      },
      { new: true }
    );
  }
}

export function initializeUser(socket: Socket) {
  verifySocketToken(socket)
    .then((decoded) => {
      socket.data.username = decoded.username;
      socket.data.designation = decoded.designation;

      const user = new SocketUser(socket);
      users.set(user.socket.id, user);
    })
    .catch((err) => {
      console.error(err.message);
      socket.disconnect();
    });
}

export function getClient(clientId: string) {
  const user = users.get(clientId);
  return user;
}
