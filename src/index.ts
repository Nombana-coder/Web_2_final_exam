import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDbConnection } from "./security/db";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./controllers/authRoutes";
<<<<<<< HEAD
import questionRoutes from "./routes/questionRoutes"; 
=======
import studentRoutes from "./controllers/studentRoutes";
>>>>>>> students

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes de l'application
app.use("/api/auth", authRoutes);
<<<<<<< HEAD
app.use("/api", questionRoutes); // <-- AJOUT 2 (Connecte /api/exams/:id/questions)
=======
app.use("/api/students", studentRoutes);
>>>>>>> students

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

<<<<<<< HEAD
=======
// 404 for anything under /api that no router matched (RG-13 JSON shape,
// not Express's default HTML error page)
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler must be registered LAST
>>>>>>> students
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




/*
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDbConnection } from "./security/db";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./controllers/authRoutes";

dotenv.config();
 
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

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
*/