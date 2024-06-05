"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinData = exports.PayLines = exports.CheckResult = void 0;
// import { Alerts } from "./Alerts";
// import { sendMessageToClient } from "./App";
const global_1 = require("./global");
const slotDataInit_1 = require("./slotDataInit");
const gameUtils_1 = require("./gameUtils");
const bonusResults_1 = require("./bonusResults");
const user_1 = require("../user/user");
const middleware_1 = require("../utils/middleware");
class CheckResult {
    constructor(clientID) {
        this.clientID = clientID;
        if (global_1.gameSettings.currentGamedata.bonus.isEnabled &&
            global_1.gameSettings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.tap)
            global_1.gameSettings.bonus.game = new bonusResults_1.bonusGame(global_1.gameSettings.currentGamedata.bonus.noOfItem, clientID);
        // if(playerData.Balance < gameWining.currentBet)
        if (global_1.playerData.Balance < global_1.gameSettings.currentBet) {
            // Alerts(clientID, "Low Balance");
            return;
        }
        // TODO : Middle ware goes here
        (() => __awaiter(this, void 0, void 0, function* () {
            yield (0, middleware_1.middleware)();
        }))();
        console.log("CurrentBet : " + global_1.gameSettings.currentBet);
        global_1.playerData.Balance -= global_1.gameSettings.currentBet;
        console.log("player balance:", global_1.playerData.Balance);
        console.log("player havewon:", global_1.playerData.haveWon);
        new slotDataInit_1.RandomResultGenerator();
        global_1.gameSettings.bonus.start = false;
        this.scatter = gameUtils_1.specialIcons.scatter;
        this.useScatter = global_1.gameSettings.useScatter && this.scatter !== null;
        this.jackpot = global_1.gameSettings.jackpot;
        this.useJackpot = this.jackpot !== null;
        this.scatterPayTable = global_1.gameSettings.scatterPayTable;
        this.bonusPaytable = global_1.gameSettings.bonusPayTable;
        this.reels = global_1.gameSettings.resultSymbolMatrix;
        console.log("SCATTER PAYTABLE : ", this.scatterPayTable);
        console.log("Bonus PAYTABLE : ", this.bonusPaytable);
        // this.scatterWin = [];
        // this.jackpotWin = [];
        // gameWining.WinningLines = [];
        // gameWining.winningSymbols = [];
        // gameWining.TotalWinningAmount = 0;
        this.scatterWinSymbols = [];
        this.jackpotWinSymbols = [];
        this.winSeq = null;
        this.bonusResult = [];
        this.winData = new WinData(clientID);
        this.searchWinSymbols();
    }
    searchWinSymbols() {
        console.log("search win symbols");
        // gameWining.freeSpins = 0;
        // gameWining.winningSymbols = [];
        // gameWining.WinningLines = [];
        // gameWining.TotalWinningAmount = 0;
        this.checkForWin();
        this.checkForScatter();
        this.checkForBonus();
        this.checkForJackpot();
        // let excludeindex: number[] = [];
        // for (let i = 0; i < this.winData.winningSymbols.length; i++) {
        //     for (let j = i + 1; j < this.winData.winningSymbols.length; j++) {
        //         if (this.winData.winningSymbols[i].some(ai => this.winData.winningSymbols[j].includes(ai)))
        //             excludeindex.push(j);
        //     }
        // }
        // let excludeindexModified: number[] = excludeindex.filter((value, index, array) => array.indexOf(value) === index);
        // for (let i = excludeindexModified.length - 1; i >= 0; i--) {
        //     this.winData.winningSymbols.splice(excludeindexModified[i], 1);
        // }
        this.winData.winningLines = this.winData.winningLines.filter((value, index, array) => array.indexOf(value) === index);
        this.winData.updateBalance();
        console.log("result :", global_1.gameSettings.resultSymbolMatrix);
        console.log("win data", this.winData);
        console.log("Bonus start", global_1.gameSettings.bonus.start);
        this.makeResultJson();
        // Math.round(num * 100) / 100).toFixed(2)
        console.log("TOTAL WINING : " + this.winData.totalWinningAmount);
        // console.log(gameWining.WinningLines);
        // console.log(gameWining.winningSymbols);
        console.log("_____________RESULT_END________________");
    }
    checkForBonus() {
        if (!global_1.gameSettings.currentGamedata.bonus.isEnabled)
            return;
        let bonusSymbols = [];
        let temp = this.findSymbol(gameUtils_1.specialIcons.bonus);
        if (temp.length > 0)
            bonusSymbols.push(...temp);
        // console.log("paytable length",this.bonusPaytable.length);
        this.bonusPaytable.forEach((element) => {
            var _a;
            if (element.symbolCount > 0 &&
                element.symbolCount == bonusSymbols.length) {
                // bonuswin = new WinData(bonusSymbols, 0, 0);
                this.winData.winningSymbols.push(bonusSymbols);
                // this.winData.bonus=true;
                global_1.gameSettings.bonus.start = true;
                if (global_1.gameSettings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.tap)
                    this.bonusResult = global_1.gameSettings.bonus.game.generateData((_a = global_1.gameSettings.bonusPayTable[0]) === null || _a === void 0 ? void 0 : _a.pay);
                global_1.gameSettings.bonus.game.setRandomStopIndex();
            }
        });
    }
    checkForWin() {
        let allComboWin = [];
        global_1.gameSettings.lineData.forEach((lb, index) => {
            let win = null;
            global_1.gameSettings.fullPayTable.forEach((Payline) => {
                //  find max win (or win with max symbols count)
                const winTemp = this.getPayLineWin(Payline, lb, allComboWin);
                if (winTemp != null) {
                    if (win == null)
                        win = winTemp;
                    else {
                        if (win.Pay < winTemp.pay || win.FreeSpins < winTemp.freeSpins)
                            win = winTemp;
                    }
                    // gameWining.WinningLines.push(index);
                    this.winData.winningLines.push(index);
                    console.log(`Line Index : ${index} : ` + lb + " - line win: " + win);
                }
            });
        });
        const filteredArray = this.checkforDuplicate(allComboWin);
        filteredArray.forEach((element) => {
            this.winData.winningSymbols.push(element.pos);
            this.winData.totalWinningAmount += element.pay * global_1.gameSettings.currentBet;
            this.winData.freeSpins += element.freeSpin;
        });
    }
    checkforDuplicate(allComboWin) {
        allComboWin.sort((a, b) => b.pos.length - a.pos.length);
        const filteredArray = [];
        for (const currentItem of allComboWin) {
            const isSubsetOfAny = filteredArray.some((item) => item.symbol === currentItem.symbol &&
                this.isSubset(currentItem.pos, item.pos));
            if (!isSubsetOfAny) {
                filteredArray.push(currentItem);
            }
        }
        return filteredArray;
    }
    isSubset(subset, superset) {
        const supersetSet = new Set(superset);
        return subset.every((elem) => supersetSet.has(elem));
    }
    checkForScatter() {
        this.scatterWinSymbols = [];
        // this.scatterWin = null;
        if (this.useScatter) {
            // console.log("scattersds", this.scatter);
            let temp = this.findSymbol(this.scatter);
            if (temp.length > 0)
                this.scatterWinSymbols.push(...temp);
            this.scatterPayTable.forEach((sPL) => {
                if (sPL.symbolCount > 0 &&
                    sPL.symbolCount == this.scatterWinSymbols.length) {
                    this.winData.winningSymbols.push(this.scatterWinSymbols);
                    this.winData.freeSpins += sPL.freeSpins;
                    this.winData.totalWinningAmount += sPL.pay;
                }
            });
            // if (this.scatterWin == null) this.scatterWinSymbols = [];
        }
    }
    checkForJackpot() {
        // this.jackpotWinSymbols = [];
        // this.jackpotWin = [];
        if (this.useJackpot) {
            var temp = this.findSymbol(this.jackpot.symbolName);
            if (temp.length > 0)
                this.jackpotWinSymbols.push(...temp);
            // console.log('find Jackpot symbols: ' + this.jackpotWinSymbols);
            if (this.jackpot.symbolsCount > 0 &&
                this.jackpot.symbolsCount == this.jackpotWinSymbols.length) {
                this.winData.winningSymbols.push(this.jackpotWinSymbols);
                this.winData.totalWinningAmount += this.jackpot.defaultAmount;
                this.winData.jackpotwin += this.jackpot.defaultAmount;
                //TODO :ADD JACKPOT WIN PAYMENT FOR THE FINAL JSON (done)
            }
        }
    }
    getPayLineWin(payLine, lineData, allComboWin) {
        if (payLine == null)
            return null;
        let master = [];
        let winSymbols = [];
        for (let i = 0; i < lineData.length; i++) {
            let tempWinSymbols = {
                pos: [],
                symbol: "",
                pay: 0,
                freeSpin: 0,
            };
            const symbol = this.getSymbolOnMatrix(i);
            const s = symbol[lineData[i]];
            tempWinSymbols.symbol = s;
            if (payLine.line[i] !== gameUtils_1.specialIcons.any && s !== payLine.line[i]) {
                return;
            }
            else if (payLine.line[i] !== gameUtils_1.specialIcons.any &&
                s === payLine.line[i]) {
                const symbolIndex = i.toString() + "," + lineData[i].toString();
                winSymbols.push(symbolIndex);
                // this.winData.winningSymbols.push(symbolIndex);
                tempWinSymbols.pos.push(symbolIndex);
                tempWinSymbols.pay = payLine.pay;
                tempWinSymbols.freeSpin = payLine.freeSpins;
            }
            master.push(tempWinSymbols);
        }
        // this.winData.winningSymbols.push(winSymbols);
        const filteredArray = master.filter((item) => item.pos.length > 0);
        const groupedBySymbol = filteredArray.reduce((acc, item) => {
            if (!acc[item.symbol]) {
                acc[item.symbol] = {
                    symbol: item.symbol,
                    pos: [],
                    pay: item.pay,
                    freeSpin: item.freeSpin,
                };
            }
            acc[item.symbol].pos = acc[item.symbol].pos.concat(item.pos);
            return acc;
        }, {});
        // Step 3: Convert the grouped object back into an array of objects
        const mergedArray = Object.values(groupedBySymbol);
        if (!payLine.pay)
            payLine.pay = 0;
        allComboWin.push(...mergedArray);
        // this.winData.freeSpins += payLine.freeSpins;
        // this.winData.totalWinningAmount += payLine.pay
        // const winData=new WinData(winSymbols, payLine.freeSpins, payLine.pay);
        return { freeSpins: payLine.freeSpins, pay: payLine.pay };
    }
    getSymbolOnMatrix(index) {
        let symbolsOnGrid = [];
        for (let i = 0; i < global_1.gameSettings.matrix.y; i++) {
            const symbol = global_1.gameSettings.resultSymbolMatrix[i][index];
            symbolsOnGrid.push(symbol);
        }
        return symbolsOnGrid;
    }
    getIndexForResult(index) {
        for (let i = 0; i < global_1.gameSettings.matrix.y; i++) {
            let symbolIndex = index.toString() + "," + i.toString();
            return symbolIndex;
        }
    }
    findSymbol(SymbolName) {
        let symbolId = -1;
        let foundArray = [];
        global_1.gameSettings.currentGamedata.Symbols.forEach((element) => {
            if (SymbolName == element.Name)
                symbolId = element.Id;
        });
        for (let i = 0; i < global_1.gameSettings.resultSymbolMatrix.length; i++) {
            for (let j = 0; j < global_1.gameSettings.resultSymbolMatrix[i].length; j++) {
                if (global_1.gameSettings.resultSymbolMatrix[i][j] == symbolId.toString())
                    foundArray.push(j.toString() + "," + i.toString());
            }
        }
        return foundArray;
    }
    makeResultJson() {
        //TODO : Try to send the jackpot win data without initializie a variable;
        this.winData.totalWinningAmount =
            Math.round(this.winData.totalWinningAmount * 100) / 100;
        const ResultData = {
            GameData: {
                ResultReel: global_1.gameSettings.resultSymbolMatrix,
                linesToEmit: this.winData.winningLines,
                // linesToEmit: gameWining.WinningLines,
                symbolsToEmit: this.winData.winningSymbols,
                // symbolsToEmit: gameWining.winningSymbols,
                WinAmout: this.winData.totalWinningAmount,
                // WinAmout: gameWining.TotalWinningAmount,
                freeSpins: this.winData.freeSpins,
                // freeSpins: gameWining.freeSpins,
                jackpot: this.winData.jackpotwin,
                isBonus: global_1.gameSettings.bonus.start,
                BonusStopIndex: global_1.gameSettings.bonus.stopIndex,
                BonusResult: this.bonusResult,
            },
            PlayerData: global_1.playerData,
        };
        (0, user_1.getClient)(this.clientID).sendMessage("ResultData", ResultData);
        // sendMessageToClient(this.clientID, "ResultData", ResultData);
    }
    // return symbols from windows
    getWindowsSymbols(reel) {
        let vSymbols = [];
        for (let si = 0; si < global_1.gameSettings.matrix.y; si++) {
            const order = si;
            vSymbols.push(global_1.gameSettings.resultSymbolMatrix[reel]);
        }
        return vSymbols;
    }
}
exports.CheckResult = CheckResult;
// Helper class to make combinations
class ComboCounter {
    constructor(maxCounterValues // positions [max Val0, max Val1, max Val2, ...]
    ) {
        this.maxCounterValues = maxCounterValues;
        this.combo = [];
        this.maxCounterValues.forEach((p) => {
            this.combo.push(0);
        });
        this.firstCombo = true;
    }
    nextCombo() {
        if (this.firstCombo) {
            this.firstCombo = false;
            return true;
        }
        for (let i = this.maxCounterValues.length - 1; i >= 0; i--) {
            if (this.combo[i] < this.maxCounterValues[i]) {
                this.combo[i]++;
                if (i != this.maxCounterValues.length - 1) {
                    // reset low "bits"
                    for (var j = i + 1; j < this.maxCounterValues.length; j++) {
                        this.combo[j] = 0;
                    }
                }
                return true;
            }
        }
        return false;
    }
    sum() {
        let s = 0;
        this.combo.forEach((ci) => {
            s += ci;
        });
        return s;
    }
    getComboCounts() {
        let counts = 1;
        this.maxCounterValues.forEach((p) => {
            if (p != 0)
                counts *= p;
        });
    }
}
class PayLines {
    constructor(line, pay, freeSpins, wild) {
        this.line = line;
        this.pay = pay;
        this.freeSpins = freeSpins;
        this.useWildInFirstPosition = false;
        this.wild = wild;
    }
    getWildLines() {
        let res = [];
        if (!global_1.gameSettings.useWild)
            return res; // return empty list
        let wPoss = this.getPositionsForWild();
        const maxWildsCount = this.useWildInFirstPosition
            ? wPoss.length - 1
            : wPoss.length;
        let minWildsCount = 1;
        let maxCounterValues = [];
        wPoss.forEach((p) => {
            maxCounterValues.push(1);
        });
        let cC = new ComboCounter(maxCounterValues);
        while (cC.nextCombo()) {
            let combo = cC.combo;
            let comboSum = cC.sum(); // count of wilds in combo
            if (comboSum >= minWildsCount && comboSum <= maxWildsCount) {
                let p = new PayLines(Array.from(this.line), this.pay, this.freeSpins, this.wild);
                for (let i = 0; i < wPoss.length; i++) {
                    let pos = wPoss[i];
                    if (combo[i] == 1) {
                        p.line[pos] = this.wild;
                    }
                }
                if (!this.isEqual(p) && !this.containEqualLine(res, p))
                    res.push(p);
            }
        }
        return res;
    }
    getPositionsForWild() {
        var _a;
        let wPoss = [];
        let counter = 0;
        let symbolsDict = [];
        global_1.gameSettings.currentGamedata.Symbols.forEach((name) => {
            const data = {
                name: name.Name,
                Id: name.Id,
                useWildSub: name.useWildSub,
            };
            symbolsDict.push(data);
        });
        for (let i = 0; i < this.line.length; i++) {
            let sName = this.line[i];
            if (sName !== gameUtils_1.specialIcons.any && sName !== this.wild) {
                if (!this.useWildInFirstPosition && counter == 0) {
                    // don't use first
                    counter++;
                }
                else {
                    if ((_a = symbolsDict[sName]) === null || _a === void 0 ? void 0 : _a.useWildSub)
                        wPoss.push(i);
                    counter++;
                }
            }
        }
        return wPoss;
    }
    isEqual(pLine) {
        if (pLine === null)
            return false;
        if (pLine.line === null)
            return false;
        if (this.line.length != pLine.line.length)
            return false;
        for (let i = 0; i < this.line.length; i++) {
            if (this.line[i] !== pLine.line[i])
                return false;
        }
        return true;
    }
    containEqualLine(pList, pLine) {
        if (pList == null)
            return false;
        if (pLine == null)
            return false;
        if (pLine.line == null)
            return false;
        for (let i = 0; i < pList.length; i++) {
            if (pList[i].isEqual(pLine))
                return true;
        }
        return false;
    }
}
exports.PayLines = PayLines;
class WinData {
    constructor(clientId) {
        this.freeSpins = 0;
        this.winningLines = [];
        this.winningSymbols = [];
        this.totalWinningAmount = 0;
        this.jackpotwin = 0;
        this.clientId = clientId;
    }
    updateBalance() {
        // gameWining.TotalWinningAmount += this.pay;
        global_1.playerData.Balance += this.totalWinningAmount;
        global_1.playerData.haveWon += this.totalWinningAmount;
        global_1.playerData.currentWining = this.totalWinningAmount;
        // gameWining.freeSpins = gameWining.freeSpins+this.freeSpins;
    }
}
exports.WinData = WinData;
