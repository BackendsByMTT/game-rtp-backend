import mongoose from "mongoose";
import { Transaction } from "./transactionType";

const transactionSchema = new mongoose.Schema<Transaction>(
  {
    creditor: {
      type: String,
    },
    creditorDesignation: {
      type: String,
    },
    debitor: {
      type: String,
    },
    credit: {
      type: String,
    },
    debitorDesignation: {
      type: String,
    },
    createdAtDate: {
      type: String,
      default: () => {
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(Date.now() + istOffset);
        return istDate.toISOString().split("T")[0];
      },
    },
    createdAtTime: {
      type: String,
      default: () => {
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(Date.now() + istOffset);
        return istDate.toISOString().split("T")[1];
      },
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model<Transaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;
