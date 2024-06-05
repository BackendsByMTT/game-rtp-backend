"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    nickName: {
        type: String,
    },
    activeStatus: {
        type: Boolean,
        default: true,
    },
    password: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    clientList: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    transactions: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Transaction",
        },
    ],
    lastLogin: {
        type: String,
    },
    loginTimes: {
        type: Number,
        default: 0,
    },
    totalRecharged: {
        type: Number,
        default: 0,
    },
    totalRedeemed: {
        type: Number,
        default: 0,
    },
    credits: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
