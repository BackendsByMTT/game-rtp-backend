import Game from "./gamesModel";
import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../../config/config";
import User from "../user/userModel";
cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});

// Function to send games as JSON
export const sendGames = async (req: Request, res: Response) => {
  const {
    gameName,
    gameThumbnailUrl,
    gameHostLink,
    type,
    category,
    tagName,
    creatorDesignation,
  } = req.body;
  // Check if the user is from the company
  if (creatorDesignation !== "company") {
    return res.status(401).json({
      error:
        "You are not authorized to perform this action. Please contact your company.",
    });
  }
  try {
    const game = new Game({
      gameName,
      gameThumbnailUrl,
      gameHostLink,
      type,
      category,
      tagName,
    });
    const savedGame = await game.save();
    res.status(201).json(savedGame);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getGames = async (req: Request, res: Response) => {
  const { category } = req.query;
  const { username } = req.body;

  try {
    let query: any = { status: true };

    if (category && category !== "all") {
      if (category === "fav") {
        if (!username) {
          return res
            .status(400)
            .json({ error: "Username is required for fav category" });
        }
        const user = await User.findOne({ username: username });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        query._id = { $in: user.favourite };
      } else {
        query.category = category;
      }
    }

    const games = await Game.aggregate([
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
    } else {
      return res.status(200).json({ featured: [], otherGames: [] });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const changeGames = async (req: Request, res: Response) => {
  try {
    const { _id, status, type } = req.body;
    if (type === "updateStatus") {
      const updatedGame = await updateGame(_id, status);
      if (!updatedGame) {
        return res.status(404).json({ message: "Game not found" });
      }
      return res.status(200).json({
        message: "Game status updated successfully",
        updatedGame: updatedGame,
      });
    }

    if (type === "deleteGame") {
      const deletedGame = await deleteGame(_id);
      if (!deletedGame) {
        return res.status(404).json({ message: "Game not found" });
      }
      return res.status(200).json({ message: "Game deleted successfully" });
    }

    return res.status(400).json({ message: "Invalid request type" });
  } catch (error) {
    console.error("Error updating game status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

async function updateGame(_id: string, status: string) {
  return await Game.findOneAndUpdate(
    { _id },
    { $set: { status } },
    { new: true }
  );
}

async function deleteGame(_id: string) {
  return await Game.findOneAndDelete({ _id });
}
//fav games

export const favourite = async (req: Request, res: Response) => {
  const { username, gameId, type } = req.body;

  try {
    // Find the user by username
    const player = await User.findOne({ username: username });
    if (!player) {
      return res.status(404).send({ message: "User not found" });
    }

    if (type === "Add") {
      // Check if the game is already in the user's favourites
      if (player.favourite.includes(gameId)) {
        return res.status(400).send({ message: "Game already selected" });
      }
      // Add the game to the user's favourites
      await User.findOneAndUpdate(
        { username: player.username },
        { $push: { favourite: gameId } },
        { new: true }
      );

      res.status(200).send({ message: "Game added to favourites" });
    } else if (type === "remove") {
      // Remove the game from the user's favourites
      await User.findOneAndUpdate(
        { username: player.username },
        { $pull: { favourite: gameId } },
        { new: true }
      );

      return res.status(200).send({
        message: "Game removed from favourites",
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error });
  }
};

//
const uploadImage = (image) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      image,
      { folder: "casinoGames" },
      (error, result) => {
        if (result && result.secure_url) {
          console.log(result.secure_url);
          return resolve(result.secure_url);
        }
        console.log(error.message);
        return reject({ message: error.message });
      }
    );
  });
};
//
export const image = async (req: Request, res: Response) => {
  if (!req.body.image) {
    return res.status(400).json({ error: "Please upload the image" });
  }
  try {
    const image = req.body.image;
    const imageUrl = await uploadImage(image);
    res.json({
      message: "File uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};
