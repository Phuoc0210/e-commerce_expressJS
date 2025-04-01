import express from 'express';
import auth from '../controllers/authController.js';

const authRouter = express.Router();
authRouter.get('/', (req, res) => {
  return res.send('hello');
});
authRouter.get('/demo', auth.demo);
authRouter.post('/register', auth.register);
export default authRouter;
