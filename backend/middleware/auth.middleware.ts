import type { NextFunction, Request, Response } from "express";
import { auth, db } from "../config/firestore.config.js";
import type { UserDocument } from "../types/firestore.types";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // ✅ Firebase Admin verifies instead of jwt.verify()
    const decoded = await auth.verifyIdToken(token);

    if (!decoded?.uid) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = userDoc.data() as UserDocument;

    next();
  } catch (error: any) {
    console.error("Auth error:", error);
    return res.status(401).json({
      error: "Invalid or expired token",
      code: error?.code || "auth/error",
    });
  }
};