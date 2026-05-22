import express from "express";
import { Admin, verifyToken } from "../middleware/auth.middleware";
import { getAllAttendance, updatePunch } from "../controller/admin.controller";
const Route = express.Router();
Route.put('/update/:id', verifyToken, Admin, updatePunch);
Route.get('/allattendance', verifyToken, Admin, getAllAttendance);
export default Route;
//# sourceMappingURL=admin.route.js.map