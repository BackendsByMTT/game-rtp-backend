"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRTP = void 0;
const global_1 = require("./global");
const slotResults_1 = require("./slotResults");
function getRTP(client, spins) {
    let moneySpend = 0;
    let moneyWon = 0;
    for (let i = 0; i < spins; i++) {
        const resultData = new slotResults_1.CheckResult(client);
        moneySpend += global_1.gameSettings.currentBet;
        moneyWon += resultData.winData.totalWinningAmount;
    }
    console.log("Bet : ", global_1.gameSettings.currentBet, " Players Total bet  : ", moneySpend, " Player Won : ", moneyWon);
    console.log("GENERATED RTP : ", (moneyWon / moneySpend) * 100);
    return;
}
exports.getRTP = getRTP;
