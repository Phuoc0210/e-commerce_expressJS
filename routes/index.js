import 'dotenv/config';
import authRouter from './authRoutes.js';

let initWebRouter = (app) => {
  const version = `${process.env.VERSION}`;
  app.use(version, authRouter);
};

export default initWebRouter;
