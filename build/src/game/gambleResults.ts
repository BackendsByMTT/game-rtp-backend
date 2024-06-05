import { gameSettings, playerData } from "./global";
import { bonusGameType } from "./gameUtils";
import { getClient } from "../user/user";
// import { sendMessageToClient } from "./App";

export class GambleGame {
  type: String;
  clientId: string;
  currentWining: number;
  totalWining: number;
  multiplier: number;
  gambleCount: number;
  maxgambleCount: number;

  constructor(clientId: string, multiplier: number = 2) {
    this.clientId = clientId;
    this.multiplier = multiplier;
    this.gambleCount = 0;
    this.totalWining = 0;
    this.maxgambleCount = 5;
  }

  generateData(gambleAmount: number) {
    console.log("triggered in gamble");

    const num = Math.random();

    // if(num>0.5){
    //     gambleAmount*= this.multiplier;
    // }else{
    //     gambleAmount=0;
    //     gameSettings.gamble.start=false;
    //     // return;
    // }
    gambleAmount *= this.multiplier;
    // gambleAmount*=0;
    this.currentWining = gambleAmount;
    this.totalWining += gambleAmount;
    this.makeResultJson(this.clientId);
    this.gambleCount++;
    console.log("gamble amount", this.gambleCount);
  }

  makeResultJson(clientId: string) {
    // const totalWinningAmount = (Math.round(amount * 100) / 100)
    console.log("triggered in make resultjson");

    const ResultData = {
      GambleData: {
        currentWining: this.currentWining,
        totalWinningAmount: this.totalWining,
      },
      PlayerData: playerData,
    };
    
    //TODO : ADD MESSAGE FOR CLIENT
    getClient(clientId).sendMessage("GambleResult", ResultData);
    // sendMessageToClient(clientId, "GambleResult", ResultData);
  }

  updateplayerBalance() {
    playerData.Balance += this.totalWining;
    playerData.haveWon += this.totalWining;
    this.makeResultJson(this.clientId);
  }

  reset() {
    this.gambleCount = 0;
    this.totalWining = 0;
    this.currentWining = 0;
    gameSettings.gamble.game = null;
    gameSettings.gamble.start = false;
  }

  checkIfClientExist(clients: Map<string, WebSocket>) {
    if (clients.has(this.clientId)) return true;
    else return false;
  }
}
