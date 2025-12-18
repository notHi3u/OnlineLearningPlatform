// routes/course.progress.ts
import express from "express";
import LessonProgress from "../models/LessonProgress.ts";
import Enrollment from "../models/Enrollment.ts";
import { authenticate } from "../middlewares/auth.ts";
import { getTotalCourseItems } from "../utils/courseProgress.ts";
import { markItemCompleted } from "../services/courseProgress.service.ts";

const router = express.Router();

// POST /api/courses/:courseId/progress
router.post("/:courseId/progress", authenticate, async (req, res) => {
  const userId = req.user!.id;
  const { courseId } = req.params;
  const { itemType, itemId } = req.body;

  if (!itemType || !itemId) {
    return res.status(400).json({ message: "Missing data" });
  }

  try {
    const result = await markItemCompleted({
      userId,
      courseId,
      itemType,
      itemId,
    });

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Update progress failed" });
  }
});

// GET /api/courses/:courseId/progress
router.get("/:courseId/progress", authenticate, async (req, res) => {
  const authUser = req.user!;
  const { courseId } = req.params;

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const { itemType, userId: queryUserId } = req.query as {
    itemType?: string;
    userId?: string;
  };

  // 🔐 xác định user cần lấy progress
  const targetUserId =
    authUser.role === "admin" || authUser.role === "teacher"
      ? queryUserId || authUser.id
      : authUser.id;

  const filter: any = {
    user: targetUserId,
    course: courseId,
  };

  if (itemType) {
    filter.itemType = itemType; // lesson | exam
  }

  try {
    const [items, total] = await Promise.all([
      LessonProgress.find(filter)
        .select("itemId itemType createdAt")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      LessonProgress.countDocuments(filter),
    ]);

    return res.json({
      userId: targetUserId,
      courseId,
      items,
      page,
      limit,
      total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to load course progress",
    });
  }
});

export default router;
