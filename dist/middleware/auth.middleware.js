import { auth, db } from "../config/firestore.config.js";
export async function verifyToken(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized Access. Please log in" });
        }
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
}
;
export async function Admin(req, res, next) {
    const user = req.user;
    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map