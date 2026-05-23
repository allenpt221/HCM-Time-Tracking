import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { punchIn, punchOut, userAttendance } from '../controller/attendance.controller.js';


const Route = express.Router();

Route.post('/punch-in', verifyToken, punchIn);
Route.post('/punch-out', verifyToken, punchOut);

Route.get('/user-attendance', verifyToken, userAttendance);



export default Route;