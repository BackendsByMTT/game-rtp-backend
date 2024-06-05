"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.initializeUser = exports.User = exports.users = void 0;
const utils_1 = require("../utils/utils");
const global_1 = require("../game/global");
const slotResults_1 = require("../game/slotResults");
const rtpgenerator_1 = require("../game/rtpgenerator");
exports.users = new Map();
class User {
    constructor(socket) {
        this.isAlive = false;
        this.heartbeat = () => {
            this.isAlive = true;
        };
        this.messageHandler = () => {
            return (message) => {
                const messageData = JSON.parse(message);
                if (messageData.id == utils_1.MESSAGEID.AUTH) {
                    console.log("AUTH : ", messageData);
                    global_1.gameSettings.initiate(messageData.data.gameID, this.socket.id);
                }
                if (messageData.id === utils_1.MESSAGEID.SPIN && global_1.gameSettings.startGame) {
                    global_1.gameSettings.currentBet = messageData.data.currentBet;
                    new slotResults_1.CheckResult(this.socket.id);
                }
                if (messageData.id == "generateRTP") {
                    global_1.gameSettings.currentBet = messageData.data.currentBet;
                    (0, rtpgenerator_1.getRTP)(this.socket.id, messageData.data.spins);
                }
                if (messageData.id === utils_1.MESSAGEID.GAMBLE) {
                }
            };
        };
        this.deleteUserFromMap = () => {
            // Attempt to delete the user from the map
            const clientID = this.socket.id;
            if (getClient(clientID)) {
                exports.users.delete(clientID);
                console.log(`User with ID ${clientID} was successfully removed.`);
            }
            else {
                console.log(`No user found with ID ${clientID}.`);
            }
        };
        this.isAlive = true;
        this.socket = socket;
        console.log("Client if from users:", socket.id);
        socket.on("pong", this.heartbeat);
        socket.on("message", this.messageHandler());
        socket.on("disconnect", () => this.deleteUserFromMap());
    }
    sendError(errorCode, message) {
        const params = {
            errorCode: errorCode,
            message: message,
        };
        this.socket.emit("internalError" /* MESSAGETYPE.ERROR */, params);
    }
    sendAlert(message) {
        this.socket.emit("alert" /* MESSAGETYPE.ALERT */, message);
    }
    sendMessage(id, message) {
        this.socket.emit("message" /* MESSAGETYPE.MESSAGE */, { id, message });
    }
}
exports.User = User;
function initializeUser(socket) {
    const user = new User(socket);
    exports.users.set(user.socket.id, user);
}
exports.initializeUser = initializeUser;
function getClient(clientId) {
    const user = exports.users.get(clientId);
    return user;
}
exports.getClient = getClient;
