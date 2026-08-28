import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import questionRoutes from "./routes/questionRoutes";

dotenv.config();

const app: Application = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Route de santé (Healthcheck)
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Montage des routes d'API (Toutes préfixées par /api)
app.use("/api", questionRoutes);
// app.use("/api/auth", authRoutes); // Si tu as un fichier de routes pour /login

// Middleware de gestion globale des erreurs
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Erreur serveur :", err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ message });
});

export default app;