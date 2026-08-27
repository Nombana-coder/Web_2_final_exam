import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDbConnection } from "./security/db";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./controllers/authRoutes";
import attemptRoutes from './routes/attemptRoutes';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api', attemptRoutes);

// --- Other teammates mount their own router under /api here, e.g.: ---
//   app.use("/api/students", studentsRouter);
//   app.use("/api/courses", coursesRouter);
//   app.use("/api/exams", examsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Error handler must be registered LAST
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await testDbConnection();
  } catch (err) {
    console.error("Could not connect to the database:", err);
  }
});
