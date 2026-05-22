import express from 'express';
import { punchIn, punchOut, userAttendance } from '../controller/attendance.controller.js';
import { Admin, verifyToken } from '../middleware/auth.middleware.js';


const Route = express.Router();

Route.post('/punch-in', verifyToken, punchIn);
Route.post('/punch-out', verifyToken, punchOut);

Route.get('/user-attendance', verifyToken, userAttendance);



export default Route;