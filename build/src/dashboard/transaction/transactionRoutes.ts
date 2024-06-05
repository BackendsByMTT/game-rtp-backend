import express from "express";
import { verifyToken } from "../../middleware/tokenAuth";
import {
  getRealTimeCredits,
  transactions,
  updateClientCredits,
} from "./transactionController";

const transactionRoutes = express.Router();

//ALL USERS POST REQUEST
transactionRoutes.post(
  "/getRealTimeCredits/:clientUserName",
  getRealTimeCredits
);
transactionRoutes.post(
  "/updateCredits/:clientUserName",
  verifyToken,
  updateClientCredits
);
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
transactionRoutes.get("/:clientUserName", verifyToken, transactions);
//ALL PUT REQ FOR USERS

export default transactionRoutes;
