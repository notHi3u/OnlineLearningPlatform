import express from "express";
import Section from "../models/Section.ts";
import Lesson from "../models/Lesson.ts";
import Exam from "../models/Exam.ts";
import Enrollment from "../models/Enrollment.ts";
import { authenticate } from "../middlewares/auth.ts";
import { canEditCourse } from "../middlewares/coursePermission.ts";

const router = express.Router();

/* ============================
   GET /api/courses/:id/content
   View content (lesson + exam)
============================ */
router.get("/:id/content", authenticate, async (req, res) => {
  try {
    const courseId = req.params.id;
    const user = req.user;

    /* ===== PERMISSION ===== */
    let canView = false;

    if (user?.role === "admin" || user?.role === "teacher" || user?.role === "student") {
      canView = true;
    }

    // if (user?.role === "student") {
    //   const enrolled = await Enrollment.exists({
    //     course: courseId,
    //     user: user.id,
    //   });
    //   if (enrolled) canView = true;
    // }

    if (!canView) {
      return res.status(403).json({ message: "Permission check failed" });
    }

    /* ===== LOAD DATA ===== */
    const sections = await Section.find({ course: courseId })
      .sort({ order: 1 })
      .lean();

    const sectionIds = sections.map(s => s._id);

    const lessons = await Lesson.find({
      section: { $in: sectionIds },
    }).lean();

    const exams = await Exam.find({
      section: { $in: sectionIds },
    }).lean();

    /* ===== MAP ===== */
    const lessonMap = new Map<string, any[]>();
    lessons.forEach(l => {
      const key = String(l.section);
      if (!lessonMap.has(key)) lessonMap.set(key, []);
      lessonMap.get(key)!.push({
        id: l._id,
        kind: "lesson",          // ✅ QUAN TRỌNG
        title: l.title,
        lessonType: l.type,
        contentUrl: l.contentUrl,
        order: l.order,
      });
    });

    const examMap = new Map<string, any[]>();
    exams.forEach(e => {
      const key = String(e.section);
      if (!examMap.has(key)) examMap.set(key, []);
      examMap.get(key)!.push({
        id: e._id,
        kind: "exam",            // ✅ QUAN TRỌNG
        title: e.title,
        description: e.description,
        order: e.order,
        durationMinutes: e.durationMinutes,
        passPercent: e.passPercent
      });
    });

    /* ===== MERGE ===== */
    const result = sections.map(sec => ({
      id: sec._id,
      title: sec.title,
      order: sec.order,
      items: [
        ...(lessonMap.get(String(sec._id)) || []),
        ...(examMap.get(String(sec._id)) || []),
      ].sort((a, b) => a.order - b.order),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load content" });
  }
});

/* ============================
   PUT /api/courses/:id/content
   Edit content (teacher/admin)
============================ */
router.put(
  "/:id/content",
  authenticate,
  canEditCourse,
  async (req, res) => {
    try {
      const { sections } = req.body;
      const courseId = req.params.id;

      if (!Array.isArray(sections)) {
        return res.status(400).json({ message: "Invalid content format" });
      }

      /* ===== CLEAN OLD ===== */
      const oldSections = await Section.find({ course: courseId });
      const sectionIds = oldSections.map(s => s._id);

      await Exam.deleteMany({ section: { $in: sectionIds } });
      await Lesson.deleteMany({ section: { $in: sectionIds } });
      await Section.deleteMany({ course: courseId });

      /* ===== RECREATE ===== */
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];

        const sectionDoc = await Section.create({
          course: courseId,
          title: sec.title,
          order: i + 1,
        });

        for (let j = 0; j < sec.items.length; j++) {
          const item = sec.items[j];

          if (item.kind === "lesson") {
            await Lesson.create({
              section: sectionDoc._id,
              title: item.title,
              type: item.lessonType,
              contentUrl: item.contentUrl,
              order: j + 1,
            });
          }

          if (item.kind === "exam") {
            await Exam.create({
              section: sectionDoc._id,
              title: item.title,
              description: item.description,
              order: j + 1,
              durationMinutes: item.durationMinutes,
              passPercent: item.passPercent
            });
          }
        }
      }

      res.json({ message: "Course content updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to save content" });
    }
  }
);

export default router;
