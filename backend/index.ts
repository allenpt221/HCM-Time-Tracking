import express, { type Request, type Response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";

import authRoutes from "./routes/user.route.js";
import attendanceRoutes from "./routes/attendance.route.js";
import AdminRoutes from "./routes/admin.route.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)


dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', AdminRoutes);


const frontendPath = path.join(__dirname, '../frontend/dist')
app.use(express.static(frontendPath));
console.log(frontendPath)

app.get(/^\/(?!api).*/, (_req: Request, res: Response) => {
res.sendFile(path.resolve(frontendPath, 'index.html'));
});




app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});