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

export async function verifyToken (
  req: Request,
  res: Response,
  next: NextFunction
){
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized Access. Please log in" });
    }

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

export async function Admin(req: Request, res: Response, next: NextFunction){
    const user = req.user;

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
}