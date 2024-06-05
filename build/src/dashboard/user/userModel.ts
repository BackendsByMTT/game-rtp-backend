import mongoose from "mongoose";
import { User } from "./userType";

const userSchema = new mongoose.Schema<User>(
  {
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<User>("User", userSchema);
export default User;
