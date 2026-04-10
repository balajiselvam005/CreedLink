import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.js";


export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.ACCESS_SECRET!) as {
      userId: string;
    };

    req.userId = payload.userId;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or Expired token" });
  }
};
