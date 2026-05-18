// src/config/firebase.config.ts

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY
} = process.env;

// Validate env variables first
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error("Missing Firebase environment variables in .env");
}

const app = initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,           // ✅ now guaranteed string
    clientEmail: FIREBASE_CLIENT_EMAIL,        // ✅ now guaranteed string
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")  // ✅ now guaranteed string
  })
});

export const db = getFirestore(app);
export const auth = getAuth(app);