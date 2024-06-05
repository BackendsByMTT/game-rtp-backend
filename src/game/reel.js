"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startInfiniteSpins = void 0;
// Example symbols with their weights
const symbolWeights = [
    { symbol: "A", weight: 5 },
    { symbol: "B", weight: 3 },
    { symbol: "C", weight: 2 },
    { symbol: "D", weight: 1 },
    { symbol: "E", weight: 1 },
];
// Generate a single reel based on weights
function generateReel(symbolWeights) {
    const reel = [];
    symbolWeights.forEach(({ symbol, weight }) => {
        for (let i = 0; i < weight; i++) {
            reel.push(symbol);
        }
    });
    // Shuffle the reel to randomize the symbol positions
    for (let i = reel.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [reel[i], reel[j]] = [reel[j], reel[i]];
    }
    return reel;
}
// Generate initial reels
function generateInitialReels(symbolWeights, columns) {
    const reels = [];
    for (let i = 0; i < columns; i++) {
        reels.push(generateReel(symbolWeights));
    }
    return reels;
}
// Spin and update the matrix
function spinMatrix(reels, rows) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < reels.length; j++) {
            if (reels[j].length === 0) {
                // Replenish the reel when it's empty
                reels[j] = generateReel(symbolWeights);
            }
            const symbol = reels[j].pop();
            row.push(symbol);
        }
        matrix.push(row);
    }
    return matrix;
}
// Example usage
const rows = 3;
const columns = 5;
let reels = generateInitialReels(symbolWeights, columns);
// Function to simulate a single spin and output the result
function singleSpin() {
    console.log(`Spin result:`);
    const matrix = spinMatrix(reels, rows);
    console.log(matrix);
}
// Simulate infinite spins
function startInfiniteSpins() {
    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    function askForSpin() {
        rl.question('Press Enter to spin, or type "exit" to quit: ', (answer) => {
            if (answer.toLowerCase() === "exit") {
                rl.close();
            }
            else {
                singleSpin();
                askForSpin();
            }
        });
    }
    askForSpin();
}
exports.startInfiniteSpins = startInfiniteSpins;
