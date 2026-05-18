import express from 'express';
import { punchIn, punchOut, userAttendance } from '../controller/attendance.controller';
import { verifyToken } from '../middleware/auth.middleware';


const Route = express.Router();

Route.post('/punch-in', verifyToken, punchIn);
Route.post('/punch-out', verifyToken, punchOut);

Route.get('/', verifyToken, userAttendance);



export default Route;