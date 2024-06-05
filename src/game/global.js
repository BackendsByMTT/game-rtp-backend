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
exports.makePayLines = exports.addPayLineSymbols = exports.gameWining = exports.UiInitData = exports.playerData = exports.gameSettings = void 0;
const slotDataInit_1 = require("./slotDataInit");
const gameUtils_1 = require("./gameUtils");
const user_1 = require("../user/user");
exports.gameSettings = {
    currentGamedata: {
        id: "",
        linesApiData: [],
        Symbols: [
            {
                Name: "",
                Id: null,
                weightedRandomness: 0,
                useWildSub: false,
                multiplier: [],
            },
        ],
    },
    matrix: { x: 5, y: 3 },
    payLine: [],
    scatterPayTable: [],
    bonusPayTable: [],
    useScatter: false,
    useWild: false,
    wildSymbol: {},
    Symbols: [],
    Weights: [],
    resultSymbolMatrix: [],
    lineData: [],
    fullPayTable: [],
    jackpot: {
        symbolName: "",
        symbolsCount: 0,
        symbolId: 0,
        defaultAmount: 0,
        increaseValue: 0,
    },
    bonus: {
        start: false,
        stopIndex: -1,
        game: null,
        // game: new bonusGame(5),
    },
    currentBet: 5,
    startGame: false,
    gamble: {
        game: null,
        maxCount: 1,
        start: false,
    },
    initiate: (GameID, clientID) => __awaiter(void 0, void 0, void 0, function* () {
        exports.gameSettings.bonusPayTable = [];
        exports.gameSettings.scatterPayTable = [];
        exports.gameSettings.Symbols = [];
        exports.gameSettings.Weights = [];
        try {
            const resp = yield fetch("https://664c355635bbda10987f44ff.mockapi.io/api/gameId/" + GameID);
            const data = yield resp.json();
            if (data == "Not found") {
                // Alerts(clientID, "Invalid Game ID");
                (0, user_1.getClient)(clientID).sendError("404", "GAMENOTFOUND");
                exports.gameSettings.startGame = false;
                return;
            }
            exports.gameSettings.currentGamedata = data;
            // const currentGameData=gameData.filter((element)=>element.id==GameID)
        }
        catch (error) {
            (0, user_1.getClient)(clientID).sendError("404", "NETWORK ERROR");
            return;
        }
        // const currentGameData=gameData.filter((element)=>element.id==GameID)
        // gameSettings.currentGamedata=currentGameData[0];
        initSymbols();
        exports.UiInitData.paylines = (0, gameUtils_1.convertSymbols)(exports.gameSettings.currentGamedata.Symbols);
        exports.gameSettings.startGame = true;
        makePayLines();
        (0, slotDataInit_1.sendInitdata)(clientID);
    }),
};
function initSymbols() {
    var _a, _b;
    for (let i = 0; i < (exports.gameSettings === null || exports.gameSettings === void 0 ? void 0 : exports.gameSettings.currentGamedata.Symbols.length); i++) {
        exports.gameSettings.Symbols.push((_a = exports.gameSettings === null || exports.gameSettings === void 0 ? void 0 : exports.gameSettings.currentGamedata.Symbols[i].Id) === null || _a === void 0 ? void 0 : _a.toString());
        exports.gameSettings.Weights.push((_b = exports.gameSettings.currentGamedata.Symbols[i]) === null || _b === void 0 ? void 0 : _b.weightedRandomness);
    }
}
exports.playerData = {
    Balance: 100000,
    haveWon: 0,
    currentWining: 5,
    // haveUsed: 0
};
exports.UiInitData = {
    paylines: (0, gameUtils_1.convertSymbols)(exports.gameSettings.currentGamedata.Symbols),
    spclSymbolTxt: [],
    AbtLogo: {
        logoSprite: "https://iili.io/JrMCqPf.png",
        link: "https://dingding-game.vercel.app/login",
    },
    ToULink: "https://dingding-game.vercel.app/login",
    PopLink: "https://dingding-game.vercel.app/login",
};
exports.gameWining = {
    winningSymbols: undefined,
    WinningLines: undefined,
    TotalWinningAmount: 0,
    shouldFreeSpin: undefined,
    freeSpins: 0,
    currentBet: 0,
};
function addPayLineSymbols(symbol, repetition, pay, freeSpins) {
    const line = Array(repetition).fill(symbol); // Create an array with 'repetition' number of 'symbol'
    if (line.length != exports.gameSettings.matrix.x) {
        let lengthToAdd = exports.gameSettings.matrix.x - line.length;
        for (let i = 0; i < lengthToAdd; i++)
            line.push("any");
    }
    exports.gameSettings.payLine.push({
        line: line,
        pay: pay,
        freeSpins: freeSpins,
    });
}
exports.addPayLineSymbols = addPayLineSymbols;
function makePayLines() {
    exports.gameSettings.currentGamedata.Symbols.forEach((element) => {
        var _a, _b;
        if (element.useWildSub || ((_a = element.multiplier) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            (_b = element.multiplier) === null || _b === void 0 ? void 0 : _b.forEach((item, index) => {
                var _a;
                addPayLineSymbols((_a = element.Id) === null || _a === void 0 ? void 0 : _a.toString(), 5 - index, item[0], item[1]);
            });
        }
        else {
            handleSpecialSymbols(element);
        }
    });
}
exports.makePayLines = makePayLines;
function handleSpecialSymbols(symbol) {
    exports.gameSettings.bonusPayTable = [];
    exports.gameSettings.scatterPayTable = [];
    switch (symbol.Name) {
        case gameUtils_1.specialIcons.jackpot:
            exports.gameSettings.jackpot.symbolName = symbol.Name;
            exports.gameSettings.jackpot.symbolId = symbol.Id;
            exports.gameSettings.jackpot.symbolsCount = symbol.symbolsCount;
            exports.gameSettings.jackpot.defaultAmount = symbol.defaultAmount;
            exports.gameSettings.jackpot.increaseValue = symbol.increaseValue;
            break;
        case gameUtils_1.specialIcons.wild:
            exports.gameSettings.wildSymbol.SymbolName = symbol.Name;
            exports.gameSettings.wildSymbol.SymbolID = symbol.Id;
            exports.gameSettings.useWild = true;
            break;
        case gameUtils_1.specialIcons.scatter:
            exports.gameSettings.scatterPayTable.push({
                symbolCount: symbol.count,
                symbolID: symbol.Id,
                pay: symbol.pay,
                freeSpins: symbol.freeSpin,
            });
            exports.gameSettings.useScatter = true;
            break;
        case gameUtils_1.specialIcons.bonus:
            exports.gameSettings.bonusPayTable.push({
                symbolCount: symbol.symbolCount,
                symbolID: symbol.Id,
                pay: symbol.pay,
                highestPayMultiplier: symbol.highestMultiplier,
            });
            break;
        default:
            break;
    }
}
