import dotenv from "dotenv";
import { migrate } from "./db/migrate";
import { testDbConnection } from "./security/db";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await migrate();
    await testDbConnection();
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
