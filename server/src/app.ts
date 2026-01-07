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
import adminCoursePublishRoutes from "./routes/admin.courses.publish.ts";
import userRoutes from "./routes/users.ts";
import adminUserRoutes from "./routes/admin.users.ts";
import studentCourseRoutes from "./routes/student.courses.ts";
import courseProgressRoutes from "./routes/course.progress.ts";
import userExamRoutes from "./routes/user.exam.ts";
import dashboardRoutes from "./routes/dashboard.ts";

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
app.use("/api/courses", courseProgressRoutes);

// ✅ ADMIN
app.use("/api/admin", adminCoursePublishRoutes);
app.use("/api/users", userRoutes);          // self
app.use("/api/admin/users", adminUserRoutes); // admin

// ✅ STUDENT
app.use("/api/student", studentCourseRoutes);

//✅ EXAM
app.use("/api/user-exams", userExamRoutes);

//✅ DASHBOARD
app.use("/api/dashboard", dashboardRoutes);

export default app;
