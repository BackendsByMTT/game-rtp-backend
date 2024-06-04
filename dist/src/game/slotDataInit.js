"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomResultGenerator = exports.sendInitdata = void 0;
const bonusResults_1 = require("./bonusResults");
const global_1 = require("./global");
const gameUtils_1 = require("./gameUtils");
const slotResults_1 = require("./slotResults");
const user_1 = require("../user/user");
function sendInitdata(clientID) {
    var _a;
    const matrix = (0, gameUtils_1.generateMatrix)(global_1.gameSettings.matrix.x, 18);
    if (global_1.gameSettings.currentGamedata.bonus.isEnabled &&
        global_1.gameSettings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.spin)
        global_1.gameSettings.bonus.game = new bonusResults_1.bonusGame(global_1.gameSettings.currentGamedata.bonus.noOfItem, clientID);
    let specialSymbols = global_1.gameSettings.currentGamedata.Symbols.filter((element) => !element.useWildSub);
    for (let i = 0; i < specialSymbols.length; i++) {
        const strng = "Player has the right to start the slot machine without using their funds for a certain number of times. The size of the bet is determined by the";
        global_1.UiInitData.spclSymbolTxt.push(strng);
    }
    const dataToSend = {
        GameData: {
            Reel: matrix,
            Lines: global_1.gameSettings.currentGamedata.linesApiData,
            Bets: global_1.gameSettings.currentGamedata.bets,
            canSwitchLines: false,
            LinesCount: global_1.gameSettings.currentGamedata.linesCount,
            autoSpin: [1, 5, 10, 20],
        },
        BonusData: global_1.gameSettings.bonus.game != null
            ? global_1.gameSettings.bonus.game.generateData((_a = global_1.gameSettings.bonusPayTable[0]) === null || _a === void 0 ? void 0 : _a.pay)
            : [],
        UIData: global_1.UiInitData,
        PlayerData: global_1.playerData,
    };
    (0, user_1.getClient)(clientID).sendMessage("InitData", dataToSend);
    // sendMessageToClient(clientID, "InitData", dataToSend);
}
exports.sendInitdata = sendInitdata;
class RandomResultGenerator {
    constructor() {
        // Generating a 3x5 matrix of random numbers based on weights
        const matrix = [];
        for (let i = 0; i < global_1.gameSettings.matrix.y; i++) {
            const row = [];
            for (let j = 0; j < global_1.gameSettings.matrix.x; j++) {
                const randomIndex = this.randomWeightedIndex(global_1.gameSettings.Weights);
                row.push(global_1.gameSettings.Symbols[randomIndex]);
            }
            matrix.push(row);
        }
        // matrix.pop();
        // matrix.pop();
        // matrix.pop();
        // matrix.push([ '4', '0', '0', '0', '4' ])
        // matrix.push([ '6', '4', '8', '4', '2' ])
        // matrix.push([ '1', '8', '4', '4', '8' ])
        global_1.gameSettings.resultSymbolMatrix = matrix;
        gameDataInit();
    }
    // Function to generate a random number based on weights
    randomWeightedIndex(weights) {
        const totalWeight = weights.reduce((acc, val) => acc + val, 0);
        const randomNumber = Math.random() * totalWeight;
        let weightSum = 0;
        for (let i = 0; i < weights.length; i++) {
            weightSum += weights[i];
            if (randomNumber <= weightSum) {
                return i;
            }
        }
        // Default to last index if not found
        return weights.length - 1;
    }
}
exports.RandomResultGenerator = RandomResultGenerator;
function gameDataInit() {
    global_1.gameSettings.lineData = global_1.gameSettings.currentGamedata.linesApiData;
    // gameSettings.bonus.start = false;
    makeFullPayTable();
}
function makeFullPayTable() {
    let payTable = [];
    let payTableFull = [];
    global_1.gameSettings.payLine.forEach((pLine) => {
        payTable.push(new slotResults_1.PayLines(pLine.line, pLine.pay, pLine.freeSpins, global_1.gameSettings.wildSymbol.SymbolName));
    });
    // console.log("payTable : ", payTable);
    for (let j = 0; j < payTable.length; j++) {
        payTableFull.push(payTable[j]);
        // console.log("payTable[j] :", payTable[j]);
        if (global_1.gameSettings.useWild) {
            let wildLines = payTable[j].getWildLines();
            wildLines.forEach((wl) => {
                payTableFull.push(wl);
            });
        }
    }
    global_1.gameSettings.fullPayTable = payTableFull;
    // let payTable: any[] = [];
    // let payTableFull = [];
    // if (gameSettings.useWild) {
    //     gameSettings.payLine.forEach((pLine) => {
    //         payTable.push(new PayLines(pLine.line, pLine.pay, pLine.freeSpins, gameSettings.wildSymbol.SymbolID.toString()))
    //     })
    // } else {
    //     gameSettings.currentGamedata.Symbols.forEach((element)=>{
    //         if(element.useWildSub || element.multiplier?.length>0){
    //             gameSettings.payLine.forEach((pLine) => {
    //                 payTable.push(new PayLines(pLine.line, pLine.pay, pLine.freeSpins, element.Id.toString()))
    //             })
    //         }
    //     })
    //     // payTable = gameSettings.payLine;
    // }
    // for (let j = 0; j < payTable.length; j++) {
    //     payTableFull.push(payTable[j]);
    //     let wildLines;
    //     if (gameSettings.useWild){
    //         wildLines = payTable[j].getWildLines();
    //         gameSettings.payLine.forEach((pLine) => {
    //             payTable.push(new PayLines(pLine.line, pLine.pay, pLine.freeSpins, gameSettings.wildSymbol.SymbolID.toString()))
    //         })
    //     }
    // }
    // console.log("full paytable", payTableFull);
    // gameSettings.fullPayTable = payTableFull;
}
