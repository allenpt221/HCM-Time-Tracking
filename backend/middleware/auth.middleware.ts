// src/middleware/auth.middleware.ts

import type { NextFunction, Request, Response } from "express";
import { auth } from "../config/firestore.config.js";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = await auth.verifyIdToken(token);
    req.body.uid = decoded.uid;   // attach uid to request
    next();

  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};