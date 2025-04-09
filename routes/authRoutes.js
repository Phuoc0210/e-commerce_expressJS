import express from 'express';
import auth from '../controllers/authController.js';
import { userAuth } from '../middleware/authUser.js';
const authRouter = express.Router();
authRouter.post('/register', auth.register);
authRouter.post('/login', auth.login);
authRouter.post('/logout', auth.logout);
authRouter.post('/send-verify-otp', auth.requestOtp);
authRouter.post('/verify-otp', auth.verifyOtp);
authRouter.post('/reset-password', auth.resetPasswordWithOtp);
authRouter.post('/refresh', auth.refresh);
authRouter.post('/demo', userAuth, (req, res) => {
  res.json({ data: 'hello from authorized' });
});
export default authRouter;
