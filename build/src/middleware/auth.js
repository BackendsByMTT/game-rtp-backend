"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyAuth = (req, res, next) => {
    var _a, _b;
    const cookie = (_b = (_a = req.headers.cookie) === null || _a === void 0 ? void 0 : _a.split("; ").find((row) => row.startsWith("userToken="))) === null || _b === void 0 ? void 0 : _b.split("=")[1];
    if (cookie) {
        jsonwebtoken_1.default.verify(cookie, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    console.error("Token verification failed: Token expired");
                    return res
                        .status(401)
                        .json({ error: "Token expired, please log in again" });
                }
                else {
                    console.error("Token verification failed:", err.message);
                    return res.status(401).json({ error: "You are not authenticated" });
                }
            }
            else {
                next();
            }
        });
    }
    else {
        return res.status(401).json({ error: "You are not authenticated" });
    }
};
exports.verifyAuth = verifyAuth;
