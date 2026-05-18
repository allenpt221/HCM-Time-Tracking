import type { Request, Response } from "express";
import { db } from "../config/firestore.config";
import { Timestamp } from "firebase-admin/firestore";
import { computeAttendance } from "../utils/calculation";
import { formatMinutesToTime } from "../utils/time";

/**
 * Helper: generate daily summary ID
 */
const getSummaryId = (userId: string) => {
  const date = new Date().toISOString().split("T")[0];
  return `${userId}_${date}`;
};

/* =========================
   PUNCH IN
========================= */
export async function punchIn(req: any, res: Response) {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: no user found",
      });
    }

    const summaryId = getSummaryId(userId);

    // 🔴 prevent duplicate active session
    const active = await db
      .collection("attendance")
      .where("userId", "==", userId)
      .where("punchOut", "==", null)
      .limit(1)
      .get();

    if (!active.empty) {
      return res.status(400).json({
        success: false,
        message: "Already punched in",
      });
    }

    const now = Timestamp.now();

    // 📌 CREATE ATTENDANCE
    const attendance = {
      userId,
      punchIn: now,
      punchOut: null,
      createdAt: now,
      summaryId,
    };

    const docRef = await db.collection("attendance").add(attendance);

    // 📌 CREATE DAILY SUMMARY
    await db.collection("summaries").doc(summaryId).set({
      userId,
      date: new Date().toISOString().split("T")[0],
      timeIn: now,
      timeOut: null,
      regularHours: 0,
      overtime: 0,
      nightDifferential: 0,
      late: 0,
      undertime: 0,
      totalHours: 0,
    });

    return res.status(201).json({
      success: true,
      attendanceId: docRef.id,
      summaryId,
      punchIn: now,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


export async function punchOut(req: Request, res: Response) {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User not found",
      });
    }

    // 🔵 FIND ACTIVE ATTENDANCE
    const snapshot = await db
      .collection("attendance")
      .where("userId", "==", userId)
      .where("punchOut", "==", null)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({
        status: false,
        message: "No active attendance found",
      });
    }

    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data();

    // 🔴 VALIDATE punchIn
    if (!data?.punchIn) {
      return res.status(400).json({
        status: false,
        message: "Invalid record: missing punchIn",
      });
    }

    const timeIn = data.punchIn.toDate();
    const timeOut = new Date();

    // 🔵 GET USER SCHEDULE
    const userSnap = await db.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const schedule = userSnap.data()?.schedule;

    // 🧠 COMPUTE ATTENDANCE
    const result = computeAttendance(timeIn, timeOut, schedule);

    const formattedResult = {
        ...result,
        undertime: formatMinutesToTime(result.undertime),
        late: formatMinutesToTime(result.late),
        overtime: formatMinutesToTime(result.overtime),
    };

    const summaryId = data.summaryId;


    // 💾 UPDATE ATTENDANCE
    await docRef.update({
      punchOut: Timestamp.now(),
      ...result,
    });

    // 💾 UPDATE SUMMARY
    await db.collection("summaries").doc(summaryId).update({
      timeOut: Timestamp.now(),
      ...result,
    });

    return res.status(200).json({
      status: true,
      message: "Punched out successfully",
      data: formattedResult,
    });

  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

export async function userAttendance(req: any, res: Response) {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const snapshot = await db
      .collection("attendance")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const data = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}