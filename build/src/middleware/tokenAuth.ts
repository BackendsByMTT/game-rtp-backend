import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  username: string;
  designation?: string;
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log("Req : ", req.headers.cookie);

  const cookie = req.headers.cookie
    ?.split("; ")
    .find((row) => row.startsWith("userToken="))
    ?.split("=")[1];

  if (cookie) {
    jwt.verify(
      cookie,
      process.env.JWT_SECRET!,
      (err: any, decoded: DecodedToken | undefined) => {
        if (err) {
          console.error("Token verification failed:", err.message);
          return res.status(401).json({ error: "You are not authenticated" });
        } else {
          req.body = {
            ...req.body,
            username: decoded.username,
            creatorDesignation: decoded.designation,
          };
          console.log("Authenticated successfully");
          // console.log(decoded, "cookie decoded");
          next();
        }
      }
    );
  } else {
    return res.status(401).json({ error: "No authentication token provided" });
  }
};
