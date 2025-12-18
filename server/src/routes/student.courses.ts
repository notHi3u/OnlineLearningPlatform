import express from "express";
import { authenticate } from "../middlewares/auth.ts";
import Enrollment from "../models/Enrollment.ts";

const router = express.Router();

/* ==============================
   GET /api/student/courses
   student only
================================ */
router.get("/courses", authenticate, async (req, res) => {
  const user = req.user!;
  // if (user.role !== "student") {
  //   return res.sendStatus(403);
  // }

  const enrollments = await Enrollment.find({ user: user.id })
    .populate({
      path: "course",
      select: "title description thumbnail teacher isPublished",
      populate: {
        path: "teacher",
        select: "name email",
      },
    })
    .sort({ enrolledAt: -1 });

  const items = enrollments.map((e) => ({
    enrollmentId: e._id,
    progress: e.progress,
    role: e.role,
    enrolledAt: e.enrolledAt,
    course: e.course,
  }));

  res.json({
    items,
    total: items.length,
  });
});

export default router;
