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
exports.image = exports.favourite = exports.changeGames = exports.getGames = exports.sendGames = void 0;
const gamesModel_1 = __importDefault(require("./gamesModel"));
const cloudinary_1 = require("cloudinary");
const config_1 = require("../../config/config");
const userModel_1 = __importDefault(require("../user/userModel"));
cloudinary_1.v2.config({
    cloud_name: config_1.config.cloud_name,
    api_key: config_1.config.api_key,
    api_secret: config_1.config.api_secret,
});
// Function to send games as JSON
const sendGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { gameName, gameThumbnailUrl, gameHostLink, type, category, tagName, creatorDesignation, } = req.body;
    // Check if the user is from the company
    if (creatorDesignation !== "company") {
        return res.status(401).json({
            error: "You are not authorized to perform this action. Please contact your company.",
        });
    }
    try {
        const game = new gamesModel_1.default({
            gameName,
            gameThumbnailUrl: gameThumbnailUrl ||
                "https://res.cloudinary.com/dhl5hifpz/image/upload/v1718447154/casinoGames/jiddczkc9oxak77h88kg.png",
            gameHostLink,
            type,
            category,
            tagName,
        });
        const savedGame = yield game.save();
        res.status(201).json(savedGame);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.sendGames = sendGames;
const getGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.query;
    const { username } = req.body;
    try {
        let query = { status: true };
        if (category && category !== "all") {
            if (category === "fav") {
                if (!username) {
                    return res
                        .status(400)
                        .json({ error: "Username is required for fav category" });
                }
                const user = yield userModel_1.default.findOne({ username: username });
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }
                query._id = { $in: user.favourite };
            }
            else {
                query.category = category;
            }
        }
        const games = yield gamesModel_1.default.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: null,
                    featured: {
                        $push: { $cond: [{ $eq: ["$type", "featured"] }, "$$ROOT", null] },
                    },
                    otherGames: {
                        $push: { $cond: [{ $ne: ["$type", "featured"] }, "$$ROOT", null] },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    featured: {
                        $filter: {
                            input: "$featured",
                            as: "game",
                            cond: { $ne: ["$$game", null] },
                        },
                    },
                    otherGames: {
                        $filter: {
                            input: "$otherGames",
                            as: "game",
                            cond: { $ne: ["$$game", null] },
                        },
                    },
                },
            },
        ]);
        if (games.length > 0) {
            return res.status(200).json(games[0]);
        }
        else {
            return res.status(200).json({ featured: [], otherGames: [] });
        }
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getGames = getGames;
const changeGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, status, updateType, type, gameName, gameThumbnailUrl, gameHostLink, category, tagName, } = req.body;
        if (updateType === "updateGame") {
            const updatedFields = {
                status,
                gameName,
                gameThumbnailUrl,
                gameHostLink,
                type,
                category,
                tagName,
            };
            const updatedGame = yield updateGame(_id, updatedFields);
            if (!updatedGame) {
                return res.status(404).json({ message: "Game not found" });
            }
            return res.status(200).json({
                message: "Game status updated successfully",
                updatedGame: updatedGame,
            });
        }
        if (updateType === "deleteGame") {
            const deletedGame = yield deleteGame(_id);
            if (!deletedGame) {
                return res.status(404).json({ message: "Game not found" });
            }
            return res.status(200).json({ message: "Game deleted successfully" });
        }
        return res.status(400).json({ message: "Invalid request type" });
    }
    catch (error) {
        console.error("Error updating game status:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.changeGames = changeGames;
const updateGame = (_id, updatedFields) => __awaiter(void 0, void 0, void 0, function* () {
    return yield gamesModel_1.default.findByIdAndUpdate(_id, updatedFields, { new: true });
});
function deleteGame(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield gamesModel_1.default.findOneAndDelete({ _id });
    });
}
//fav games
const favourite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, gameId, type } = req.body;
    try {
        // Find the user by username
        const player = yield userModel_1.default.findOne({ username: username });
        if (!player) {
            return res.status(404).send({ message: "User not found" });
        }
        if (type === "Add") {
            // Check if the game is already in the user's favourites
            if (player.favourite.includes(gameId)) {
                return res.status(400).send({ message: "Game already selected" });
            }
            // Add the game to the user's favourites
            yield userModel_1.default.findOneAndUpdate({ username: player.username }, { $push: { favourite: gameId } }, { new: true });
            res.status(200).send({ message: "Game added to favourites" });
        }
        else if (type === "remove") {
            // Remove the game from the user's favourites
            yield userModel_1.default.findOneAndUpdate({ username: player.username }, { $pull: { favourite: gameId } }, { new: true });
            return res.status(200).send({
                message: "Game removed from favourites",
            });
        }
    }
    catch (error) {
        res.status(500).send({ message: "Internal Server Error", error });
    }
});
exports.favourite = favourite;
//
const uploadImage = (image) => {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload(image, { folder: "casinoGames" }, (error, result) => {
            if (result && result.secure_url) {
                console.log(result.secure_url);
                return resolve(result.secure_url);
            }
            console.log(error.message);
            return reject({ message: error.message });
        });
    });
};
//
const image = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.image) {
        return res.status(400).json({ error: "Please upload the image" });
    }
    try {
        const image = req.body.image;
        const imageUrl = yield uploadImage(image);
        res.json({
            message: "File uploaded successfully",
            imageUrl: imageUrl,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to upload file" });
    }
});
exports.image = image;
