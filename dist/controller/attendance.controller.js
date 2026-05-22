import { db } from "../config/firestore.config";
import { Timestamp } from "firebase-admin/firestore";
import { computeAttendance } from "../utils/calculation";
import { formatMinutesToTime } from "../utils/time";
export async function punchIn(req, res) {
    try {
        const userId = req.user?.uid;
        const startWork = req.user?.schedule.start;
        const timezone = req.user?.timezone;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: no user found",
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
        const localNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
        const localDate = now.toLocaleDateString("en-CA", { timeZone: timezone });
        const inMin = localNow.getHours() * 60 + localNow.getMinutes();
        const shiftStart = Number(startWork.split(":")[0]) * 60 +
            Number(startWork.split(":")[1]);
        const lateMinutes = Math.max(0, inMin - shiftStart);
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
            nightDifferential: 0,
            late: lateMinutes,
            undertime: 0,
            totalHours: 0,
        });
        return res.status(201).json({
            success: true,
            message: "Punch-in successful",
            data: {
                attendanceId: attendanceRef.id,
                summaryId: summaryRef.id,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
export async function punchOut(req, res) {
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
        const attendanceDoc = snapshot.docs[0];
        const attendanceRef = attendanceDoc.ref;
        const attendanceData = attendanceDoc.data();
        if (!attendanceData?.punchIn) {
            return res.status(400).json({
                status: false,
                message: "Invalid record: missing punchIn",
            });
        }
        const timeIn = attendanceData.punchIn.toDate();
        const timeOut = new Date();
        const userSnap = await db.collection("users").doc(userId).get();
        if (!userSnap.exists) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }
        const schedule = userSnap.data()?.schedule;
        const result = computeAttendance(timeIn, timeOut, schedule);
        const formattedResult = {
            ...result,
            undertime: formatMinutesToTime(result.undertime),
            late: formatMinutesToTime(result.late),
            overtime: formatMinutesToTime(result.overtime),
        };
        const summarySnap = await db
            .collection("summaries")
            .where("attendanceId", "==", attendanceDoc.id)
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
            ...result,
        });
        return res.status(200).json({
            status: true,
            message: "Punched out successfully",
            data: formattedResult,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
}
export async function userAttendance(req, res) {
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
            .map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
            .sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() ?? new Date(a.createdAt);
            const dateB = b.createdAt?.toDate?.() ?? new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
//# sourceMappingURL=attendance.controller.js.map