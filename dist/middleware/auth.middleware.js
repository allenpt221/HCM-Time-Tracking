import { auth, db } from "../config/firestore.config.js";
export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }
        // ✅ Firebase Admin verifies instead of jwt.verify()
        const decoded = await auth.verifyIdToken(token);
        if (!decoded?.uid) {
            return res.status(401).json({ error: "Invalid token" });
        }
        const userDoc = await db.collection("users").doc(decoded.uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }
        req.user = userDoc.data();
        next();
    }
    catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({
            error: "Invalid or expired token",
            code: error?.code || "auth/error",
        });
    }
};
//# sourceMappingURL=auth.middleware.js.map