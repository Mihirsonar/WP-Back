import express from 'express';
import cors from 'cors';
import healthCheckRouter from './routes/healthroute.js';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import cookieparser from 'cookie-parser';
import taskRouter from './routes/task.route.js';

const app = express();

app.use(express.json());
app.use(cookieparser());

app.use(cors({
  origin: 
    'http://localhost:5173',
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

// app.options("*", cors());

app.use('/api/v1/healthcheck', healthCheckRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/projects', taskRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Project Management Application!');
}); 

export default app;