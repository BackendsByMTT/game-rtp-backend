import { Transaction } from "../transaction/transactionType";

export interface User {
  username: string;
  nickName?: string;
  activeStatus: boolean;
  password: string;
  designation: string;
  clientList: User[];
  transactions: Transaction[];
  lastLogin?: string;
  loginTimes: number;
  totalRecharged: number;
  totalRedeemed: number;
  credits: number;
  createdAt: Date;
}
