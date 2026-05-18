import type { Request, Response } from "express";
import { auth, db } from "../config/firestore.config.js";
import { Timestamp } from "firebase-admin/firestore";
import type { UserDocument } from "../types/firestore.types";

import dotenv from "dotenv";
import { to12Hour } from "../utils/time.js";
dotenv.config();

export async function SignUp(req: Request, res: Response) {
  try {
    const { username, email, password, confirmPassword, role, schedule } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: false,
        message: "All fields are required!"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: false,
        message: "Passwords do not match"
      });
    }

    if (!schedule?.start || !schedule?.end) {
      return res.status(400).json({
        status: false,
        message: "Schedule (start and end) is required",
      });
    }

    const normalizedSchedule = {
      start: schedule.start,
      end: schedule.end,
    };

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username
    });

    const newUser: UserDocument = {
      uid: userRecord.uid,
      name: username,
      email,
      role: role ?? "employee",
      timezone: "Asia/Manila",
      schedule: normalizedSchedule,
      createdAt: Timestamp.now()
    };

    const schedule12Hour = {
        start: to12Hour(newUser.schedule.start),
        end: to12Hour(newUser.schedule.end),
    };

    await db.collection("users").doc(userRecord.uid).set(newUser);

    return res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: {
        uid: userRecord.uid,
        name: username,
        email,
        role: newUser.role,
        schedule: schedule12Hour,
      }
    });

  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
}

export async function SignIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required"
      });
    }
    
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );

    const firebaseData = await firebaseRes.json();

    if (!firebaseRes.ok) {
      return res.status(401).json({
        status: false,
        message: firebaseData.error?.message || "Invalid credentials"
      });
    }

    const idToken = firebaseData.idToken;

    // ✅ Step 2 — verify the token with Firebase Admin
    const decoded = await auth.verifyIdToken(idToken);

    // ✅ Step 3 — get user data from Firestore
    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    const userData = userDoc.data() as UserDocument;

    // ✅ Step 4 — set cookie
    res.cookie("accessToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      }
    });

  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
}

export async function GetProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        status: false,
        message: "Unauthorized: user not found in request"
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: "Profile retrieved successfully",
      data: user
    });

  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message
    });
  }
}