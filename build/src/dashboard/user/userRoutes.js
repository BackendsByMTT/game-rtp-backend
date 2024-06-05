"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenAuth_1 = require("../../middleware/tokenAuth");
const auth_1 = require("../../middleware/auth");
const userController_1 = require("./userController");
const userRoutes = express_1.default.Router();
//ALL USERS POST REQUEST
userRoutes.post("/createCompany", userController_1.companyCreation);
userRoutes.post("/login", userController_1.loginUser);
userRoutes.post("/addClient", tokenAuth_1.verifyToken, userController_1.addClient);
userRoutes.post("/getClientList", userController_1.getClientList);
//ALL DELETE REQ FOR USERS
userRoutes.delete("/clients/:username", auth_1.verifyAuth, userController_1.deleteClient);
//ALL PUT REQ FOR USERS
userRoutes.put("/updateClientPassword/:clientUserName", tokenAuth_1.verifyToken, userController_1.updateClientPassword);
userRoutes.put("/clientsStatus/:clientUserName", tokenAuth_1.verifyToken, userController_1.updateClientStatus);
//ALL GET REQ FOR USERS
userRoutes.get("/userData", tokenAuth_1.verifyToken, userController_1.clientData);
exports.default = userRoutes;
