import express from 'express';
import cors from 'cors';
import healthCheckRouter from './routes/healthroute.js';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import cookieparser from 'cookie-parser';
import taskRouter from './routes/task.route.js';
import connectDB from './db/connect.js';

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://work-pilot-front.vercel.app"
];

let isConnected = false;

const connectOnce = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

app.use(async (req, res, next) => {
  await connectOnce();
  next();
});

app.use(express.json());
app.use(cookieparser());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.options("*", cors());

app.use('/api/v1/healthcheck', healthCheckRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/projects', taskRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Project Management Application!');
});

export default app;