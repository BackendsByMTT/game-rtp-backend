"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GambleGame = void 0;
const global_1 = require("./global");
const user_1 = require("../user/user");
// import { sendMessageToClient } from "./App";
class GambleGame {
    constructor(clientId, multiplier = 2) {
        this.clientId = clientId;
        this.multiplier = multiplier;
        this.gambleCount = 0;
        this.totalWining = 0;
        this.maxgambleCount = 5;
    }
    generateData(gambleAmount) {
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
    makeResultJson(clientId) {
        // const totalWinningAmount = (Math.round(amount * 100) / 100)
        console.log("triggered in make resultjson");
        const ResultData = {
            GambleData: {
                currentWining: this.currentWining,
                totalWinningAmount: this.totalWining,
            },
            PlayerData: global_1.playerData,
        };
        //TODO : ADD MESSAGE FOR CLIENT
        (0, user_1.getClient)(clientId).sendMessage("GambleResult", ResultData);
        // sendMessageToClient(clientId, "GambleResult", ResultData);
    }
    updateplayerBalance() {
        global_1.playerData.Balance += this.totalWining;
        global_1.playerData.haveWon += this.totalWining;
        this.makeResultJson(this.clientId);
    }
    reset() {
        this.gambleCount = 0;
        this.totalWining = 0;
        this.currentWining = 0;
        global_1.gameSettings.gamble.game = null;
        global_1.gameSettings.gamble.start = false;
    }
    checkIfClientExist(clients) {
        if (clients.has(this.clientId))
            return true;
        else
            return false;
    }
}
exports.GambleGame = GambleGame;
