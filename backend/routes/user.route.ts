import express from 'express';
import { SignUp, SignIn, GetProfile, SignOut, GetAllUsers } from '../controller/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const Route = express.Router();

Route.post('/signup', SignUp);

Route.post('/signin', SignIn);

Route.post('/signout', SignOut);




Route.get('/profile', verifyToken, GetProfile);


export default Route;