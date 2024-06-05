"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenAuth_1 = require("../../middleware/tokenAuth");
const transactionController_1 = require("./transactionController");
const transactionRoutes = express_1.default.Router();
//ALL USERS POST REQUEST
transactionRoutes.post("/getRealTimeCredits/:clientUserName", transactionController_1.getRealTimeCredits);
transactionRoutes.post("/updateCredits/:clientUserName", tokenAuth_1.verifyToken, transactionController_1.updateClientCredits);
// transactionRoutes.post(
//   "/updatePlayerCreditsInGame",
//   verifyToken,
//   updatePlayerCredits
// );
// transactionRoutes.post(
//   "/getTransanctionOnBasisOfDatePeriod",
//   getTransanctionOnBasisOfDatePeriod
// );
//ALL GET REQ FOR USERS
transactionRoutes.get("/:clientUserName", tokenAuth_1.verifyToken, transactionController_1.transactions);
//ALL PUT REQ FOR USERS
exports.default = transactionRoutes;
