import express from 'express';
import auth from '../controllers/authController.js';

const authRouter = express.Router();
authRouter.get('/demo', auth.demo);
export default authRouter;
