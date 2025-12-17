import type { Request, Response, NextFunction } from "express";
import Course from "../models/Course.ts";

export const canEditCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 🛡️ guard cứng – tránh req undefined
    if (!req) {
      return res.status(500).json({ message: "Invalid request object" });
    }

    const courseId =
      req.courseId ||
      req.params?.courseId ||
      req.body?.courseId ||
      req.params?.id;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role === "admin") {
      return next();
    }

    const isOwner =
      user.role === "teacher" &&
      String(course.teacher) === String(user.id);

    if (!isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (err) {
    console.error("canEditCourse error:", err);
    return res.status(500).json({ message: "Permission check failed" });
  }
};
