import app from "./app.js";
import "dotenv/config";
import { connectDB } from "./config/db.ts";
import { seedDatabase } from "./seed.js";

const PORT = process.env.PORT!;

async function start() {
  await connectDB();
  console.log("📦 Connected to MongoDB");
  
  // Run seed script
  await seedDatabase();
  
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

start();
