import dotenv from "dotenv";
import { testDbConnection } from "./security/db";
import app from "./app";

dotenv.config();
 
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await testDbConnection();
  } catch (err) {
    console.error("Could not connect to the database:", err);
  }
});
