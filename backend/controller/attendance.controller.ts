import type { Request, Response } from "express";
import { db } from "../config/firestore.config.js";
import { Timestamp } from "firebase-admin/firestore";
import { computeAttendance } from "../utils/calculation.js";
import { formatMinutesToTime } from "../utils/time.js";

function parseTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, 0);
}

function getLocalDate(time: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
  }).format(time);
}

export async function punchIn(req: any, res: Response) {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: no user found",
      });
    }

    const userSnap = await db.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const schedule = userSnap.data()?.schedule;
    const timezone = userSnap.data()?.timezone;

    if (!schedule?.start || !schedule?.end || !timezone) {
      return res.status(400).json({
        success: false,
        message: "Missing schedule or timezone",
      });
    }

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

    const now = new Date();
    const localDate = getLocalDate(now, timezone);

    const shiftStart = parseTime(localDate, schedule.start);

    const lateMinutes = Math.max(
      0,
      (now.getTime() - shiftStart.getTime()) / 60000
    );

    const late = Math.floor(lateMinutes);

    const attendanceRef = await db.collection("attendance").add({
      userId,
      punchIn: now,
      punchOut: null,
      createdAt: now,
    });

    const summaryRef = await db.collection("summaries").add({
      userId,
      attendanceId: attendanceRef.id,
      date: localDate,
      timeIn: now,
      timeOut: null,
      regularHours: 0,
      overtime: 0,
      undertime: 0,
      late,
      totalHours: 0,
      createdAt: now,
    });

    return res.status(201).json({
      success: true,
      message: "Punch-in successful",
      data: {
        attendanceId: attendanceRef.id,
        summaryId: summaryRef.id,
        late,
      },
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

    const doc = snapshot.docs[0];
    const attendanceRef = doc.ref;
    const data = doc.data();

    if (!data?.punchIn) {
      return res.status(400).json({
        status: false,
        message: "Invalid record: missing punchIn",
      });
    }

    const timeIn = data.punchIn.toDate();
    const timeOut = new Date();

    const userSnap = await db.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const schedule = userSnap.data()?.schedule;

    const timezone = userSnap.data()?.timezone;

    if (!schedule?.start || !schedule?.end || !timezone) {
      return res.status(400).json({
        status: false,
        message: "Missing schedule or timezone",
      });
    }

    const result = computeAttendance(timeIn, timeOut, schedule, timezone);

    const safe = {
      totalHours: Number(result.totalHours ?? 0),
      regularHours: Number(result.regularHours ?? 0),
      overtime: Math.max(0, Number(result.overtime ?? 0)),
      undertime: Math.max(0, Number(result.undertime ?? 0)),
      late: Math.max(0, Number(result.late ?? 0)),
    };

    const formattedResult = {
      ...safe,
      undertime: formatMinutesToTime(safe.undertime),
      late: formatMinutesToTime(safe.late),
      overtime: formatMinutesToTime(safe.overtime),
    };

    const summarySnap = await db
      .collection("summaries")
      .where("attendanceId", "==", doc.id)
      .limit(1)
      .get();

    if (summarySnap.empty) {
      return res.status(400).json({
        status: false,
        message: "Summary not found for this attendance",
      });
    }

    const summaryRef = summarySnap.docs[0].ref;

    await attendanceRef.update({
      punchOut: Timestamp.now(),
    });

    await summaryRef.update({
      timeOut: Timestamp.now(),
      ...safe,
    });

    return res.status(200).json({
      status: true,
      message: "Punched out successfully",
      data: formattedResult,
      time: schedule
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
      .collection("summaries")
      .where("userId", "==", userId)
      .get();

    const data = snapshot.docs
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        const aTime = a.createdAt?.toDate?.() ?? new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() ?? new Date(b.createdAt);
        return bTime.getTime() - aTime.getTime();
      });

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