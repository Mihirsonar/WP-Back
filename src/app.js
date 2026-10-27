import express from "express";
import healthCheckRouter from "./routes/healthroute.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import cookieparser from "cookie-parser";
import taskRouter from "./routes/task.route.js";
import listRouter from "./routes/list.routes.js";
import commentRouter from "./routes/comment.routes.js";
import connectDB from "./db/connect.js";
import userRouter from "./routes/user.routes.js";
import cors from "cors";

const app = express();

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
  origin: [
    "https://work-pilot-front.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/projects", taskRouter);
app.use("/api/v1/projects", listRouter);
app.use("/api/v1/projects", commentRouter);
app.use("/api/v1/users", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the WorkPilot API!");
});

export default app;
