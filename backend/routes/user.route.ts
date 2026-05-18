import express from 'express';
import { SignUp, SignIn, GetProfile } from '../controller/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const Route = express.Router();

Route.post('/signup', SignUp);

Route.post('/signin', SignIn);

Route.get('/profile', verifyToken, GetProfile);


export default Route;