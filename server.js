import express from 'express';
import bodyParser from 'body-parser';
import initWebRoutes from './routes/index.js';
import connectDB from './db/index.js';
import cors from 'cors';
import 'dotenv/config';

let app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

initWebRoutes(app);

connectDB();

let port = process.env.PORT || 6969;
let server = app.listen(port, () => {
  console.log(`Server listening on port ${server.address().port}`);
});
