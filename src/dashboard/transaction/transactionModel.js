"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
const Transaction = mongoose_1.default.model("Transaction", transactionSchema);
exports.default = Transaction;
