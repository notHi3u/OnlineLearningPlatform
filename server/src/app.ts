import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.ts";
import courseRoutes from "./routes/courses.ts";
import enrollmentRoutes from "./routes/enrollment.ts";

// ✅ CONTENT
import courseSectionRoutes from "./routes/courses.sections.ts";
import sectionLessonRoutes from "./routes/sections.lessons.ts";
import courseBuilderRoutes from "./routes/courses.builder.ts";
import courseContentRoutes from "./routes/courses.content.ts";
import examRoutes from "./routes/exams.ts";

const app = express();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enroll", enrollmentRoutes);

// ✅ COURSE CONTENT
app.use("/api/courses", courseSectionRoutes);   // /courses/:id/sections
app.use("/api/sections", sectionLessonRoutes);  // /sections/:id/lessons
app.use("/api/courses", courseBuilderRoutes);   // /courses/:id/builder
app.use("/api/courses", courseContentRoutes);
app.use("/api/exams", examRoutes);

export default app;
