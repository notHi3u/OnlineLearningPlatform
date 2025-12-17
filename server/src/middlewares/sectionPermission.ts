import type { Request, Response, NextFunction } from "express";
import Section from "../models/Section.ts";
import { canEditCourse } from "./coursePermission.ts";

export const canEditSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sectionId = req.params.id || req.params.sectionId;
    if (!sectionId) {
      return res.status(400).json({ message: "Section ID is required" });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // 👇 inject courseId cho middleware sau
    (req as any).courseId = section.course.toString();

    return canEditCourse(req, res, next);
  } catch (err) {
    console.error("canEditSection error:", err);
    return res.status(500).json({ message: "Permission check failed" });
  }
};
