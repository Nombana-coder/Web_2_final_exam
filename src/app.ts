import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import courseRoutes from "./routes/courseRoutes";
import examRoutes from "./routes/examRoutes";
import questionRoutes from "./routes/questionRoutes";
import attemptRoutes from "./routes/attemptRoutes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/exams", examRoutes);
app.use("/api", questionRoutes);
app.use("/api", attemptRoutes);

app.get(["/health", "/api/health"], (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

export default app;