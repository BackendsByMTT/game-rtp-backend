"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientStatus = exports.updateClientPassword = exports.deleteClient = exports.getClientList = exports.addClient = exports.clientData = exports.loginUser = exports.companyCreation = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("./userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../../config/config");
const clientDesignation = {
    company: "master",
    master: "distributer",
    distributer: "subDistributer",
    subDistributer: "store",
    store: "player",
};
//{create company controller}
const companyCreation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
        return res
            .status(400)
            .json({ error: "Password should be at least 6 characters" });
    }
    try {
        const existingUser = yield userModel_1.default.findOne({ username });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: "This username is already registered" });
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create the new company user
        const company = yield userModel_1.default.create({
            username,
            password: hashedPassword,
            credits: 1000000,
            designation: "company",
            activeStatus: true,
        });
        // Respond with success message and company data
        return res
            .status(201)
            .json({ message: "Company created successfully", company });
    }
    catch (err) {
        // Respond with server error
        return res
            .status(500)
            .json({ error: "Internal server error", details: err.message });
    }
});
exports.companyCreation = companyCreation;
//{Login user controller}
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const referer = req.headers.referer || req.headers.origin;
    console.log(referer);
    try {
        const user = yield userModel_1.default.findOne({ username }, "username password activeStatus designation credits lastLogin loginTimes");
        if (!user) {
            return res.status(404).json({ error: "User not found. Please register" });
        }
        if (user.designation === "player") {
            return res.status(400).json({ error: "Login Restricted For Player" });
        }
        const passwordIsValid = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        if (user.activeStatus !== true) {
            return res.status(403).json({ error: "Account is inactive" });
        }
        if (referer === config_1.config.crm && user.designation === "player") {
            return res.status(401).json({ message: "Login Restricted For Player" });
        }
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(Date.now() + istOffset);
        user.lastLogin = istDate.toISOString();
        user.loginTimes = (user.loginTimes || 0) + 1;
        yield user.save();
        const token = jsonwebtoken_1.default.sign({
            username: user.username,
            designation: user.designation,
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("userToken", token, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            // secure: true,
            sameSite: "none",
        });
        return res.status(200).json({ message: "Login successful", token: token });
    }
    catch (err) {
        return res
            .status(500)
            .json({ error: "Internal server error", details: err.message });
    }
});
exports.loginUser = loginUser;
//{GET CLIENT DATA AFTER LOGIN}
const clientData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    try {
        const user = yield userModel_1.default.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});
exports.clientData = clientData;
//{Add sub users to company}
const addClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clientUserName, password, clientNickName, isPlayer, creatorDesignation, username, credits, } = req.body;
    try {
        if (yield userModel_1.default.findOne({ username: clientUserName })) {
            return res.status(409).json({ error: "Username already exists" });
        }
        let finalDesignation;
        if (creatorDesignation === "subDistributor" && !isPlayer) {
            finalDesignation =
                clientDesignation[creatorDesignation] || "subDistributor";
        }
        else if (isPlayer) {
            finalDesignation = "player";
        }
        else {
            finalDesignation = clientDesignation[creatorDesignation];
        }
        // console.log("Received designation:", req.body.designation);
        // console.log("Final designation:", finalDesignation);
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield userModel_1.default.create({
            username: clientUserName,
            password: hashedPassword,
            nickName: clientNickName,
            designation: finalDesignation,
            credits: credits,
        });
        if (newUser) {
            yield addClientToUserList(res, username, newUser._id);
            return res.status(201).json({ message: "Client added successfully" });
        }
        else {
            return res.status(500).json({ error: "Failed to create client" });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.addClient = addClient;
//{addClientToUserList from addClient}
function addClientToUserList(res, userId, clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedUserClients = yield userModel_1.default.findOneAndUpdate({ username: userId }, { $push: { clientList: clientId } }, { new: true });
            if (!updatedUserClients) {
                res.status(201).json({ error: "failed to add" });
            }
            return updatedUserClients;
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}
//{getRealTimeCredits of users}
const getClientList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { pageNumber, limit, username } = req.body;
    const page = parseInt(pageNumber) || 1;
    const limitValue = parseInt(limit) || 10;
    const startIndex = (page - 1) * limitValue;
    const results = {};
    try {
        const user = yield userModel_1.default.aggregate([
            { $match: { username: username } },
            {
                $project: {
                    clientCount: { $size: "$clientList" },
                },
            },
        ]);
        const totalClientCount = (_a = user[0]) === null || _a === void 0 ? void 0 : _a.clientCount;
        if (!totalClientCount) {
            return res.status(204).json({ error: "No User Found for this client" });
        }
        if (startIndex + limitValue < totalClientCount) {
            results.next = {
                page: page + 1,
                limit: limitValue,
            };
        }
        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limitValue,
            };
        }
        const userList = yield userModel_1.default.find({ username: username })
            .populate({
            path: "clientList",
            select: "username nickName activeStatus designation credits totalRedeemed totalRecharged lastLogin loginTimes",
            options: {
                limit: limitValue,
                skip: startIndex,
            },
        })
            .exec();
        const userClientList = (_b = userList[0]) === null || _b === void 0 ? void 0 : _b.clientList;
        if (!userClientList) {
            return res.status(201).json({ error: "No Clients Found" });
        }
        return res
            .status(200)
            .json({ userClientList, totalPageCount: totalClientCount });
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
exports.getClientList = getClientList;
//{DELETE CLIENT}
const deleteClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        const deletedClient = yield userModel_1.default.findOneAndDelete({
            username: username,
        });
        if (!deletedClient) {
            return res.status(404).json({ error: "Client not found" });
        }
        return res
            .status(204)
            .json({ message: `Successfully deleted client ${username}` });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.deleteClient = deleteClient;
//{change user password}
const updateClientPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { changedPassword } = req.body;
    const { clientUserName } = req.params;
    // console.log(username);
    try {
        if (!clientUserName) {
            return res.status(400).json({ error: "Username is required." });
        }
        const newPassword = changedPassword;
        if (!newPassword) {
            return res.status(400).json({ error: "New password is required." });
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        const updatedClient = yield userModel_1.default.findOneAndUpdate({ username: clientUserName }, { password: hashedPassword }, { new: true });
        if (updatedClient) {
            return res
                .status(200)
                .json({ message: "Client password updated successfully." });
        }
        else {
            return res.status(404).json({ error: "Client not found." });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal server error occurred while updating the client password.",
        });
    }
});
exports.updateClientPassword = updateClientPassword;
const updateClientStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientUserName } = req.params;
        const { activeStatus } = req.body;
        const updatedClient = yield userModel_1.default.findOneAndUpdate({ username: clientUserName }, {
            activeStatus: activeStatus,
        }, { new: true });
        if (updatedClient) {
            return res
                .status(200)
                .json({ message: "Client status updated successfully" });
        }
        else {
            return res.status(404).json({ error: "Client not found" });
        }
    }
    catch (err) {
        return res
            .status(500)
            .json({ error: "Internal server error", details: err });
    }
});
exports.updateClientStatus = updateClientStatus;
