import { spec } from "node:test/reporters";
import { bonusGame } from "./bonusResults";
import { UiInitData, gameSettings, playerData } from "./global";
import { bonusGameType, generateMatrix } from "./gameUtils";
import { PayLines } from "./slotResults";
import { getClient } from "../user/user";

export function sendInitdata(clientID: string) {
  const matrix = generateMatrix(gameSettings.matrix.x, 18);
  if (
    gameSettings.currentGamedata.bonus.isEnabled &&
    gameSettings.currentGamedata.bonus.type == bonusGameType.spin
  )
    gameSettings.bonus.game = new bonusGame(
      gameSettings.currentGamedata.bonus.noOfItem,
      clientID
    );

  let specialSymbols = gameSettings.currentGamedata.Symbols.filter(
    (element) => !element.useWildSub
  );

  for (let i = 0; i < specialSymbols.length; i++) {
    const strng =
      "Player has the right to start the slot machine without using their funds for a certain number of times. The size of the bet is determined by the";
    UiInitData.spclSymbolTxt.push(strng);
  }

  const dataToSend = {
    GameData: {
      Reel: matrix,
      Lines: gameSettings.currentGamedata.linesApiData,
      Bets: gameSettings.currentGamedata.bets,
      canSwitchLines: false,
      LinesCount: gameSettings.currentGamedata.linesCount,
      autoSpin: [1, 5, 10, 20],
    },
    BonusData:
      gameSettings.bonus.game != null
        ? gameSettings.bonus.game.generateData(
            gameSettings.bonusPayTable[0]?.pay
          )
        : [],
    UIData: UiInitData,
    PlayerData: playerData,
  };
  getClient(clientID).sendMessage("InitData", dataToSend);
  // sendMessageToClient(clientID, "InitData", dataToSend);
}

export class RandomResultGenerator {
  constructor() {
    // Generating a 3x5 matrix of random numbers based on weights
    const matrix: string[][] = [];
    for (let i = 0; i < gameSettings.matrix.y; i++) {
      const row: string[] = [];
      for (let j = 0; j < gameSettings.matrix.x; j++) {
        const randomIndex: number = this.randomWeightedIndex(
          gameSettings.Weights
        );
        row.push(gameSettings.Symbols[randomIndex]);
      }
      matrix.push(row);
    }

    // matrix.pop();
    // matrix.pop();
    // matrix.pop();
    // matrix.push([ '4', '0', '0', '0', '4' ])
    // matrix.push([ '6', '4', '8', '4', '2' ])
    // matrix.push([ '1', '8', '4', '4', '8' ])

    gameSettings.resultSymbolMatrix = matrix;
    gameDataInit();
  }

  // Function to generate a random number based on weights
  randomWeightedIndex(weights: number[]): number {
    const totalWeight: number = weights.reduce((acc, val) => acc + val, 0);
    const randomNumber: number = Math.random() * totalWeight;
    let weightSum: number = 0;
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

function gameDataInit() {
  gameSettings.lineData = gameSettings.currentGamedata.linesApiData;
  // gameSettings.bonus.start = false;
  makeFullPayTable();
}

function makeFullPayTable() {
  let payTable: PayLines[] = [];
  let payTableFull = [];

  gameSettings.payLine.forEach((pLine) => {
    payTable.push(
      new PayLines(
        pLine.line,
        pLine.pay,
        pLine.freeSpins,
        gameSettings.wildSymbol.SymbolName
      )
    );
  });

  // console.log("payTable : ", payTable);

  for (let j = 0; j < payTable.length; j++) {
    payTableFull.push(payTable[j]);
    // console.log("payTable[j] :", payTable[j]);

    if (gameSettings.useWild) {
      let wildLines = payTable[j].getWildLines();
      wildLines.forEach((wl) => {
        payTableFull.push(wl);
      });
    }
  }

  gameSettings.fullPayTable = payTableFull;
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
