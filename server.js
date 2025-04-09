import express from 'express';
import bodyParser from 'body-parser';
import initWebRoutes from './routes/index.js';
import connectDB from './db/index.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
let app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 6969;
let server = app.listen(port, () => {
  console.log(`Server listening on port ${server.address().port}`);
});
