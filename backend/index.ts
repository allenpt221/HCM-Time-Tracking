import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";

import authRoutes from "./routes/user.route";
import attendanceRoutes from "./routes/attendance.route";
import summariesRoutes from "./routes/summaries.route";
import AdminRoutes from "./routes/admin.route";


dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/summaries', summariesRoutes);
app.use('/api/admin', AdminRoutes);





app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});