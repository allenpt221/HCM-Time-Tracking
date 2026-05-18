
import { db } from "./firestore.config.js";

import type {
  CollectionReference,
  DocumentData
} from "firebase-admin/firestore";

import type {
  UserDocument,
  AttendanceDocument,
  DailySummaryDocument,
  WeeklySummaryDocument
} from "../types/firestore.types.ts";

const createCollection = <T = DocumentData>(
  collectionName: string
): CollectionReference<T> => {
  return db.collection(collectionName) as CollectionReference<T>;
};

export const usersCol = createCollection<UserDocument>("users");

export const attendanceCol = createCollection<AttendanceDocument>("attendance");

export const dailySummaryCol = createCollection<DailySummaryDocument>("dailySummary");

export const weeklySummaryCol = createCollection<WeeklySummaryDocument>("weeklySummary");