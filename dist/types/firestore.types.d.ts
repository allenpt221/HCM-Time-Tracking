import { Timestamp } from "firebase-admin/firestore";
export type UserRole = "employee" | "admin";
export type PunchType = "time_in" | "time_out";
export type SummaryStatus = "complete" | "incomplete";
export interface Schedule {
    start: string;
    end: string;
}
export interface UserDocument {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
    timezone: string;
    schedule: Schedule;
    createdAt: Timestamp;
}
export type CreateUserPayload = Omit<UserDocument, "uid" | "createdAt">;
export type UpdateUserPayload = Partial<Omit<UserDocument, "uid" | "createdAt">>;
export interface AttendanceDocument {
    id?: string;
    userId: string;
    type: PunchType;
    timestamp: Timestamp;
    date: string;
    editedBy: string | null;
    editedAt: Timestamp | null;
}
export type CreateAttendancePayload = Omit<AttendanceDocument, "id" | "editedBy" | "editedAt">;
export type EditAttendancePayload = {
    timestamp: Timestamp;
    editedBy: string;
    editedAt: Timestamp;
};
export interface DailySummaryDocument {
    id?: string;
    userId: string;
    date: string;
    timeIn: Timestamp | null;
    timeOut: Timestamp | null;
    regularHours: number;
    overtime: number;
    nightDifferential: number;
    late: number;
    undertime: number;
    totalHours: number;
    status: SummaryStatus;
}
export type UpsertDailySummaryPayload = Omit<DailySummaryDocument, "id">;
export interface WeeklySummaryDocument {
    id?: string;
    userId: string;
    weekStart: string;
    weekEnd: string;
    totalRegularHours: number;
    totalOvertime: number;
    totalNightDifferential: number;
    totalLate: number;
    totalUndertime: number;
    daysPresent: number;
    daysAbsent: number;
}
export type UpsertWeeklySummaryPayload = Omit<WeeklySummaryDocument, "id">;
export interface FirestoreResponse<T> {
    id: string;
    data: T;
}
export interface DailyReportRow extends DailySummaryDocument {
    userName: string;
    userEmail: string;
    scheduleStart: string;
    scheduleEnd: string;
}
export interface WeeklyReportRow extends WeeklySummaryDocument {
    userName: string;
    userEmail: string;
}
export interface ComputedHours {
    regularHours: number;
    overtime: number;
    nightDifferential: number;
    late: number;
    undertime: number;
    totalHours: number;
}
//# sourceMappingURL=firestore.types.d.ts.map