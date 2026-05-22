import { db } from "../config/firestore.config";
import { computeAttendance } from "../utils/calculation";
import { formatMinutesToTime } from "../utils/time";
import { Timestamp } from "firebase-admin/firestore";
export async function updatePunch(req, res) {
    try {
        const { id } = req.params;
        const { punchIn, punchOut } = req.body;
        const docRef = db.collection("attendance").doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ message: "Attendance record not found" });
        }
        const attendanceData = docSnap.data();
        const updateData = {};
        if (punchIn !== undefined)
            updateData.punchIn = Timestamp.fromDate(new Date(punchIn));
        if (punchOut !== undefined)
            updateData.punchOut = Timestamp.fromDate(new Date(punchOut));
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No fields provided to update" });
        }
        // Resolve final timeIn and timeOut for recalculation
        const timeIn = updateData.punchIn
            ? new Date(punchIn)
            : attendanceData?.punchIn?.toDate();
        const timeOut = updateData.punchOut
            ? new Date(punchOut)
            : attendanceData?.punchOut?.toDate();
        if (!timeIn || !timeOut) {
            return res.status(400).json({ message: "Both punchIn and punchOut are required to recalculate" });
        }
        // Get user schedule
        const userId = attendanceData?.userId;
        const userSnap = await db.collection("users").doc(userId).get();
        if (!userSnap.exists) {
            return res.status(404).json({ message: "User not found" });
        }
        const schedule = userSnap.data()?.schedule;
        // Recompute attendance metrics
        const result = computeAttendance(timeIn, timeOut, schedule);
        // Update attendance
        await docRef.update(updateData);
        // Find and update linked summary
        const summarySnap = await db
            .collection("summaries")
            .where("attendanceId", "==", id)
            .limit(1)
            .get();
        if (!summarySnap.empty) {
            const summaryRef = summarySnap.docs[0].ref;
            await summaryRef.update({
                ...(updateData.punchIn && { timeIn: updateData.punchIn }),
                ...(updateData.punchOut && { timeOut: updateData.punchOut }),
                ...result, // late, overtime, undertime, regularHours, nightDifferential, totalHours
            });
        }
        const formattedResult = {
            ...result,
            undertime: formatMinutesToTime(result.undertime),
            late: formatMinutesToTime(result.late),
            overtime: formatMinutesToTime(result.overtime),
        };
        return res.status(200).json({
            message: "Punch updated successfully",
            updated: {
                punchIn: punchIn ?? null,
                punchOut: punchOut ?? null,
            },
            computed: formattedResult,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message });
    }
}
export async function getAllAttendance(req, res) {
    try {
        const snapshot = await db.collection("summaries").get();
        if (snapshot.empty) {
            return res.status(404).json({ message: "No attendance records found" });
        }
        const summaries = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        const userIds = [...new Set(summaries.map((s) => s.userId))];
        const userSnaps = await Promise.all(userIds.map((uid) => db.collection("users").doc(uid).get()));
        const userMap = {};
        userSnaps.forEach((snap) => {
            if (snap.exists) {
                const { name, email, role, schedule } = snap.data();
                userMap[snap.id] = { name, email, role, schedule };
            }
        });
        // Merge user data into each summary
        const data = summaries
            .map((summary) => ({
            ...summary,
            user: userMap[summary.userId] ?? null,
        }))
            .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });
        return res.status(200).json({
            success: true,
            total: data.length,
            data,
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//# sourceMappingURL=admin.controller.js.map