import app from "./app.js";
import "dotenv/config";
import { connectDB } from "./config/db.ts"; // <-- thêm dòng này

const PORT = process.env.PORT!;

connectDB(); // <-- phải gọi connectDB

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
