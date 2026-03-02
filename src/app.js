import express from 'express';
import cors from 'cors';
import healthCheckRouter from './routes/healthroute.js';
import authRouter from './routes/auth.routes.js';
import cookieparser from 'cookie-parser';
const app = express();

app.use(express.json());
app.use(cookieparser());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
})); 

app.use('/api/v1/healthcheck', healthCheckRouter);
app.use('/api/v1/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Project Management Application!');
}); 

export default app;