import express from 'express';
import { addUser, loginUser, joinNetwork, approvePermission } from '../controller/UserController';

const userRouter = express.Router();

userRouter.post('/add-user',addUser);
userRouter.post('/login-user',loginUser);
userRouter.post('/join-network',joinNetwork);
userRouter.post('/approve',approvePermission);

export {userRouter};