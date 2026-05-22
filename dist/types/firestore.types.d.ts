import { Timestamp } from "firebase-admin/firestore";
export type UserRole = "employee" | "admin";
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
    punchIn: Timestamp;
    punchOut: Timestamp;
    timestamp: Timestamp;
}
//# sourceMappingURL=firestore.types.d.ts.map