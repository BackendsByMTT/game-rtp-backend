"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bonusGame = void 0;
const global_1 = require("./global");
const gameUtils_1 = require("./gameUtils");
class bonusGame {
    constructor(nosOfItem, clientId) {
        this.noOfItems = nosOfItem;
        this.type = gameUtils_1.bonusGameType.default;
        this.result = [];
        this.clientId = clientId;
        // this.noise=noise;
    }
    generateData(totalPay) {
        this.result = [];
        let res = [];
        let sum = 0;
        this.totalPay = totalPay;
        this.maxPay = Math.floor(totalPay * 0.5);
        let part = Math.floor((this.totalPay - this.maxPay) / (this.noOfItems - 2));
        this.noise = Math.floor(part / (this.noOfItems - 2));
        for (let i = 0; i < this.noOfItems - 2; i++) {
            this.result.push(part);
            sum += part;
        }
        for (let i = 0; i < this.result.length; i++) {
            let min = this.noise * i > 0 ? this.noise * i : this.noise;
            let max = this.noise * (i + 1);
            let j = this.result.length - 1 - i;
            let deviation = Math.floor(Math.random() * (max - min) + min);
            this.result[i] -= deviation;
            this.result[j] += deviation;
        }
        let diff = this.totalPay - this.maxPay - sum;
        this.result[Math.floor(Math.random() * res.length)] += diff;
        this.result.push(-1);
        this.result.push(this.maxPay);
        this.shuffle(this.result);
        for (let i = 0; i < this.result.length; i++) {
            res.push(this.result[i].toString());
        }
        return res;
    }
    setRandomStopIndex() {
        let amount = 0;
        if (global_1.gameSettings.bonus.start &&
            global_1.gameSettings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.spin) {
            global_1.gameSettings.bonus.stopIndex = Math.round(Math.random() * this.noOfItems);
            amount = this.result[global_1.gameSettings.bonus.stopIndex];
        }
        else if (global_1.gameSettings.bonus.start &&
            global_1.gameSettings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.tap) {
            global_1.gameSettings.bonus.stopIndex = -1;
            this.result.forEach((element) => {
                if (element >= 0) {
                    amount += element;
                }
            });
        }
        if (!amount || amount < 0)
            amount = 0;
        global_1.playerData.Balance += amount;
        global_1.playerData.haveWon += amount;
        global_1.gameSettings.bonus.stopIndex = -1;
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let k = array[i];
            array[i] = array[j];
            array[j] = k;
        }
    }
}
exports.bonusGame = bonusGame;
