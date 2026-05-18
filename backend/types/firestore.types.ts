import { Timestamp } from "firebase-admin/firestore";



export type UserRole = "employee" | "admin";


export type SummaryStatus = "complete" | "incomplete";

export interface Schedule {
  start: string; // "09:00" (24hr format)
  end: string;   // "18:00" (24hr format)
}

export interface UserDocument {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  timezone: string;       // e.g. "Asia/Manila"
  schedule: Schedule;
  createdAt: Timestamp;
}

// For creating a new user (uid comes from Firebase Auth)
export type CreateUserPayload = Omit<UserDocument, "uid" | "createdAt">;

// For updating a user (all fields optional except uid)
export type UpdateUserPayload = Partial<Omit<UserDocument, "uid" | "createdAt">>;



export interface AttendanceDocument {
  id?: string;            // Firestore auto-generated doc ID
  userId: string;         // Firebase Auth UID
  punchIn: Timestamp;
  punchOut: Timestamp;
  timestamp: Timestamp;   // exact punch datetime
}

// For logging a new punch
export type CreateAttendancePayload = Omit<AttendanceDocument, "id" | "editedBy" | "editedAt">;

// For admin editing a punch
export type EditAttendancePayload = {
  timestamp: Timestamp;
  editedBy: string;
  editedAt: Timestamp;
};



export interface DailySummaryDocument {
  id?: string;
  userId: string;
  date: string;                 // "YYYY-MM-DD"
  timeIn: Timestamp | null;
  timeOut: Timestamp | null;
  regularHours: number;         // hours up to scheduled shift (max 8)
  overtime: number;             // hours beyond shift end
  nightDifferential: number;    // hours worked between 22:00–06:00
  late: number;                 // hours arrived after shift start
  undertime: number;            // hours left before shift end
  totalHours: number;           // regularHours + overtime
}

// For creating/updating a daily summary
export type UpsertDailySummaryPayload = Omit<DailySummaryDocument, "id">;



export interface WeeklySummaryDocument {
  id?: string;                    // "{userId}_{weekStart}"
  userId: string;
  weekStart: string;              // "YYYY-MM-DD" Monday
  weekEnd: string;                // "YYYY-MM-DD" Sunday
  totalRegularHours: number;
  totalOvertime: number;
  totalNightDifferential: number;
  totalLate: number;              // total late hours in the week
  totalUndertime: number;         // total undertime hours in the week
  daysPresent: number;
  daysAbsent: number;
}

// For creating/updating a weekly summary
export type UpsertWeeklySummaryPayload = Omit<WeeklySummaryDocument, "id">;



// Generic Firestore response wrapper
export interface FirestoreResponse<T> {
  id: string;
  data: T;
}

// For admin daily report view (joins user + dailySummary)
export interface DailyReportRow extends DailySummaryDocument {
  userName: string;
  userEmail: string;
  scheduleStart: string;
  scheduleEnd: string;
}

// For admin weekly report view (joins user + weeklySummary)
export interface WeeklyReportRow extends WeeklySummaryDocument {
  userName: string;
  userEmail: string;
}

// Computed hours breakdown (used in backend logic)
export interface ComputedHours {
  regularHours: number;
  overtime: number;
  nightDifferential: number;
  late: number;
  undertime: number;
  totalHours: number;
}