import type { Request, Response, NextFunction } from "express";
import Lesson from "../models/Lesson.ts";
import Section from "../models/Section.ts";
import { canEditCourse } from "./coursePermission.ts";

export const canEditLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lessonId = req.params.id || req.params.lessonId;
    if (!lessonId) {
      return res.status(400).json({ message: "Lesson ID is required" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const section = await Section.findById(lesson.section);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // 👇 inject courseId cho canEditCourse
    (req as any).courseId = section.course.toString();

    return canEditCourse(req, res, next);
  } catch (err) {
    console.error("canEditLesson error:", err);
    return res.status(500).json({ message: "Permission check failed" });
  }
};
