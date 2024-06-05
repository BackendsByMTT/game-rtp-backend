import Transaction from "./transactionModel";
import User from "../user/userModel";
import { NextFunction, Request, Response } from "express";
import { error } from "console";
import mongoose from "mongoose";

const clientDesignation = {
  company: "master",
  master: "distributer",
  distributer: "subDistributer",
  subDistributer: "store",
  store: "player",
};

//{GET THE DETAILS OF USERS CREDITS}
export const getRealTimeCredits = async (req: Request, res: Response) => {
  const { clientUserName } = req.params;
  if (!clientUserName) {
    return res.status(400).json({ error: "username is required." });
  }
  try {
    const user = await User.findOne({ username: clientUserName }, "credits");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.status(200).json({ credits: user.credits });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving user credits." });
  }
};

//{UPDATE THE USER CREDITS}
export const updateClientCredits = async (req: Request, res: Response) => {
  const { clientUserName } = req.params;
  const { credits, username, creatorDesignation, type } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ username: username }).session(session);
    const clientUser = await User.findOne({ username: clientUserName }).session(
      session
    );

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "User not found." });
    }
    if (!clientUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Client user not found." });
    }
    if (typeof credits !== "number" || isNaN(credits) || !isFinite(credits)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid credits value." });
    }

    const creditValue = credits;
    const userCredits = user.credits - creditValue;
    const clientUserCredits = clientUser.credits + creditValue;

    if (user.credits <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Please recharge yourself first" });
    }

    if (creditValue > user.credits) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Client's credits cannot exceed user's credits." });
    }

    if (user.designation !== "company" && userCredits <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Insufficient credits for this transaction." });
    }

    if (clientUserCredits < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Invalid credit update. Client's credits would become negative.",
      });
    }

    const [transaction] = await Transaction.create(
      [
        {
          credit: creditValue,
          creditorDesignation: creatorDesignation,
          debitorDesignation: clientDesignation[creatorDesignation],
          creditor: username,
          debitor: clientUserName,
        },
      ],
      { session }
    );

    // Update client user
    await User.findOneAndUpdate(
      { username: clientUserName },
      {
        $push: { transactions: transaction._id },
        credits: clientUserCredits,
        ...(creditValue > 0 && {
          totalRecharged: (clientUser.totalRecharged || 0) + creditValue,
        }),
        ...(creditValue < 0 && {
          totalRedeemed:
            (clientUser.totalRedeemed || 0) + Math.abs(creditValue),
        }),
      },
      { new: true, session }
    );

    // Update user (creditor)
    await User.findOneAndUpdate(
      { username: username },
      {
        $push: { transactions: transaction._id },
        credits: userCredits,
      },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: "Credits updated successfully." });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};

//{getTransanctionOnBasisOfDatePeriod OF USER}
// export const getTransanctionOnBasisOfDatePeriod = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const {
//     pageNumber = 1,
//     limit = 20,
//     designation,
//     hierarchyName,
//     startDate,
//     endDate,
//   } = req.body;

//   const page = parseInt(pageNumber);
//   const limitValue = parseInt(limit);

//   const startIndex = (page - 1) * limitValue;
//   const endIndex = page * limitValue;

//   const results = {};

//   var totalPageCount = await Transaction.countDocuments().exec();

//   if (endIndex < totalPageCount) {
//     results.next = {
//       page: page + 1,
//       limit: limitValue,
//     };
//   }

//   if (startIndex > 0) {
//     results.previous = {
//       page: page - 1,
//       limit: limitValue,
//     };
//   }

//   try {
//     if (designation === "company") {
//       if (hierarchyName !== "all") {
//         const transactions = await Transaction.find({
//           $and: [
//             {
//               $or: [
//                 { creditorDesignation: hierarchyName },
//                 { debitorDesignation: hierarchyName },
//               ],
//             },
//             {
//               createdAtDate: {
//                 $gte: startDate,
//                 $lte: endDate,
//               },
//             },
//           ],
//         })
//           .limit(limitValue)
//           .skip(startIndex)
//           .exec();
//         totalPageCount = await Transaction.find({
//           $and: [
//             {
//               $or: [
//                 { creditorDesignation: hierarchyName },
//                 { debitorDesignation: hierarchyName },
//               ],
//             },
//             {
//               createdAtDate: {
//                 $gte: startDate,
//                 $lte: endDate,
//               },
//             },
//           ],
//         })
//           .countDocuments()
//           .exec();

//         const transactionsFiltered = transactions.map((items) => {
//           if (items.creditor === clientUserName)
//             return { ...items.toObject(), creditor: "COMPANY" };
//           return items.toObject();
//         });

//         if (transactionsFiltered)
//           return res.status(200).json({ transactionsFiltered, totalPageCount });
//         return res
//           .status(201)
//           .json({ error: "unable to find transactions try again" });
//       } else {
//         const transactions = await Transaction.find({
//           createdAtDate: { $gte: startDate, $lte: endDate },
//         })
//           .limit(limitValue)
//           .skip(startIndex)
//           .exec();
//         totalPageCount = await Transaction.find({
//           createdAtDate: { $gte: startDate, $lte: endDate },
//         })
//           .countDocuments()
//           .exec();

//         const transactionsFiltered = transactions.map((items) => {
//           if (items.creditor === clientUserName)
//             return { ...items.toObject(), creditor: "COMPANY" };
//           return items.toObject();
//         });

//         if (transactionsFiltered)
//           return res.status(200).json({ transactionsFiltered, totalPageCount });
//         return res
//           .status(201)
//           .json({ error: "unable to find transactions try again" });
//       }
//     } else {
//       const transactions = await Transaction.find({
//         $and: [
//           {
//             $or: [{ creditor: clientUserName }, { debitor: clientUserName }],
//           },
//           {
//             createdAtDate: { $gte: startDate, $lte: endDate },
//           },
//         ],
//       })
//         .limit(limitValue)
//         .skip(startIndex)
//         .exec();
//       const transactionsFiltered = transactions.map((items) => {
//         if (items.creditor === clientUserName)
//           return { ...items.toObject(), creditor: "Me" };
//         if (items.debitor === clientUserName)
//           return { ...items.toObject(), creditor: "YourOwner", debitor: "Me" };
//         return items.toObject();
//       });

//       if (transactionsFiltered)
//         return res.status(200).json({ transactionsFiltered });
//       return res
//         .status(201)
//         .json({ error: "unable to find transactions try again" });
//     }
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// };

//{UPDATE PLAYER CREDITS}
// export const updatePlayerCredits = async (req: Request, res: Response) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { playerUserName, newCredits } = req.body;
//     const player = await User.findOne({ username: playerUserName }).session(
//       session
//     );

//     if (!player) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ error: "Player not found" });
//     }

//     const newCreditsValue = parseFloat(newCredits);
//     if (isNaN(newCreditsValue)) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ error: "Invalid newCredits value" });
//     }

//     const playerUserCredits = player.credits + newCreditsValue;

//     const transaction = await Transaction.create(
//       [
//         {
//           credit: newCreditsValue,
//           creditor: "game",
//           creditorDesignation: "game",
//           debitor: playerUserName,
//         },
//       ],
//       { session }
//     );

//     await User.findOneAndUpdate(
//       { username: playerUserName },
//       { $push: { transactions: transaction[0]._id } },
//       { session }
//     );

//     const updatedPlayer = await User.findOneAndUpdate(
//       { username: playerUserName },
//       { credits: playerUserCredits },
//       { new: true, session }
//     );

//     await session.commitTransaction();
//     session.endSession();

//     if (updatedPlayer) {
//       return res
//         .status(200)
//         .json({ message: "Player credits updated successfully" });
//     } else {
//       return res
//         .status(500)
//         .json({ error: "Unable to update player credits, please try again" });
//     }
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error(err);
//     return res
//       .status(500)
//       .json({ error: "Internal server error", details: err.message });
//   }
// };

//{GET TRANSACTIONS OF USERS}
export const transactions = async (req: Request, res: Response) => {
  const { clientUserName } = req.params;
  try {
    const user = await User.findOne({ username: clientUserName });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.populate("transactions");
    console.log(user.transactions);
    return res.status(200).json(user.transactions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
