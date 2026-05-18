import { db } from "./firestore.config.js";
const createCollection = (collectionName) => {
    return db.collection(collectionName);
};
export const usersCol = createCollection("users");
export const attendanceCol = createCollection("attendance");
export const dailySummaryCol = createCollection("dailySummary");
export const weeklySummaryCol = createCollection("weeklySummary");
//# sourceMappingURL=collection.js.map