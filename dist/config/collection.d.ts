import type { CollectionReference, DocumentData } from "firebase-admin/firestore";
import type { UserDocument, AttendanceDocument, DailySummaryDocument, WeeklySummaryDocument } from "../types/firestore.types.ts";
export declare const usersCol: CollectionReference<UserDocument, DocumentData>;
export declare const attendanceCol: CollectionReference<AttendanceDocument, DocumentData>;
export declare const dailySummaryCol: CollectionReference<DailySummaryDocument, DocumentData>;
export declare const weeklySummaryCol: CollectionReference<WeeklySummaryDocument, DocumentData>;
//# sourceMappingURL=collection.d.ts.map