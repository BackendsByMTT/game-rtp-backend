"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSymbols = exports.convertData = exports.generateMatrix = exports.weightedRandom = exports.bonusGameType = exports.specialIcons = void 0;
const global_1 = require("./global");
var specialIcons;
(function (specialIcons) {
    specialIcons["bonus"] = "Bonus";
    specialIcons["scatter"] = "Scatter";
    specialIcons["jackpot"] = "Jackpot";
    specialIcons["wild"] = "Wild";
    specialIcons["any"] = "any";
})(specialIcons || (exports.specialIcons = specialIcons = {}));
var bonusGameType;
(function (bonusGameType) {
    bonusGameType["tap"] = "tap";
    bonusGameType["spin"] = "spin";
    bonusGameType["default"] = "default";
})(bonusGameType || (exports.bonusGameType = bonusGameType = {}));
function weightedRandom(items, weights) {
    if (items.length !== weights.length) {
        throw new Error("Items and weights must be of the same size");
    }
    if (!items.length) {
        throw new Error("Items must not be empty");
    }
    // Preparing the cumulative weights array.
    const cumulativeWeights = [];
    for (let i = 0; i < weights.length; i += 1) {
        cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
    }
    // Getting the random number in a range of [0...sum(weights)]
    const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const randomNumber = maxCumulativeWeight * Math.random();
    // Picking the random item based on its weight.
    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        if (cumulativeWeights[itemIndex] >= randomNumber) {
            return {
                item: items[itemIndex],
                index: itemIndex,
            };
        }
    }
    // This should not happen if the weights are correctly defined,
    // but if we get here, return the last item.
    return {
        item: items[items.length - 1],
        index: items.length - 1,
    };
}
exports.weightedRandom = weightedRandom;
// Function to generate a 5x18 matrix of randomly selected items based on weights
function generateMatrix(n_Rows, n_Columns) {
    const matrix = [];
    for (let i = 0; i < n_Rows; i++) {
        const row = [];
        for (let j = 0; j < n_Columns; j++) {
            const result = weightedRandom(global_1.gameSettings.Symbols, global_1.gameSettings.Weights);
            row.push(result.item);
        }
        matrix.push(row);
    }
    // console.log(matrix);
    return matrix;
}
exports.generateMatrix = generateMatrix;
function convertData(data) {
    const result = [];
    for (const row of data) {
        const convertedRow = Array.from(Array(row.length + 1).keys()).join(",");
        result.push(`"${convertedRow}"`);
    }
    return result;
}
exports.convertData = convertData;
function convertSymbols(data) {
    let uiData = {
        symbols: [],
    };
    data.forEach((element) => {
        var _a;
        if (((_a = element.multiplier) === null || _a === void 0 ? void 0 : _a.length) > 0 && element.useWildSub) {
            let symbolData = {
                ID: element.Id,
                multiplier: {},
            };
            const multiplierObject = {};
            element.multiplier.forEach((item, index) => {
                multiplierObject[(5 - index).toString() + "x"] = item[0];
            });
            symbolData.multiplier = multiplierObject;
            uiData.symbols.push(symbolData);
        }
    });
    // const convertedData = data.map(symbol => {
    //   if (symbol.multiplier?.length>0 && symbol.useWildSub) {
    //     const multiplierObject = {};
    //     multiplierObject['5x'] = symbol.multiplier[0][0];
    //     multiplierObject['4x'] = symbol.multiplier[1][0];
    //     multiplierObject['3x'] = symbol.multiplier[2][0];
    //     return {
    //       ID: symbol.Id,
    //       multiplier: multiplierObject
    //     };
    //   } else {
    //     return null; // Exclude symbols without multipliers
    //   }
    // }).filter(symbol => symbol !== null); // Remove null values
    // console.log("converted data",{ symbols: convertedData });
    // return { symbols: convertedData };
    return uiData;
}
exports.convertSymbols = convertSymbols;
