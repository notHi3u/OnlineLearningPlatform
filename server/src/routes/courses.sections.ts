import express from "express";
import Section from "../models/Section.ts";
import Lesson from "../models/Lesson.ts";
import Exam from "../models/Exam.ts";
import { authenticate } from "../middlewares/auth.ts";
import { canEditCourse } from "../middlewares/coursePermission.ts";

const router = express.Router();

/* =============================
   CREATE SECTION
   POST /api/courses/:courseId/sections
============================= */
router.post(
  "/:courseId/sections",
  authenticate,
  (req, _res, next) => {
    req.params.id = req.params.courseId; // for canEditCourse
    next();
  },
  canEditCourse,
  async (req, res) => {
    const { title } = req.body;
    const { courseId } = req.params;

    const last = await Section.find({ course: courseId })
      .sort({ order: -1 })
      .limit(1);

    const order = last.length ? last[0].order + 1 : 1;

    const section = await Section.create({
      course: courseId,
      title,
      order,
    });

    res.status(201).json(section);
  }
);

/* =============================
   GET SECTIONS (PUBLIC)
   GET /api/courses/:courseId/sections
============================= */
router.get("/:courseId/sections", async (req, res) => {
  const sections = await Section.find({
    course: req.params.courseId,
  }).sort({ order: 1 });

  res.json(sections);
});

/* =============================
   GET SECTION CONTENT
   lesson + exam (ORDERED)
   GET /api/sections/:id/content
============================= */
router.get("/sections/:id/content", async (req, res) => {
  const sectionId = req.params.id;

  const lessons = await Lesson.find({ section: sectionId })
    .sort({ order: 1 })
    .lean();

  const exams = await Exam.find({ section: sectionId })
    .sort({ order: 1 })
    .lean();

  const items = [
    ...lessons.map(l => ({
      id: l._id,
      type: "lesson",
      title: l.title,
      lessonType: l.type,
      contentUrl: l.contentUrl,
      order: l.order,
    })),
    ...exams.map(e => ({
      id: e._id,
      type: "exam",
      title: e.title,
      description: e.description,
      totalScore: e.totalScore,
      order: e.order,
    })),
  ].sort((a, b) => a.order - b.order);

  res.json(items);
});

/* =============================
   UPDATE SECTION
   PUT /api/sections/:id
============================= */
router.put(
  "/sections/:id",
  authenticate,
  async (req, res, next) => {
    const section = await Section.findById(req.params.id);
    if (!section) return res.sendStatus(404);

    req.params.id = String(section.course); // for canEditCourse
    next();
  },
  canEditCourse,
  async (req, res) => {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title },
      { new: true }
    );

    res.json(section);
  }
);

/* =============================
   REORDER SECTIONS
   PUT /api/sections/reorder
============================= */
router.put(
  "/sections/reorder",
  authenticate,
  async (req, res, next) => {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ message: "Invalid items" });
    }

    const section = await Section.findById(items[0].id);
    if (!section) return res.sendStatus(404);

    req.params.id = String(section.course);
    next();
  },
  canEditCourse,
  async (req, res) => {
    const { items } = req.body;

    // tránh unique index collision
    await Section.bulkWrite(
      items.map((item: any, i: number) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { order: -(i + 1) },
        },
      }))
    );

    await Section.bulkWrite(
      items.map((item: any) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { order: item.order },
        },
      }))
    );

    res.json({ message: "Section reordered" });
  }
);

/* =============================
   DELETE SECTION (CASCADE)
   DELETE /api/sections/:id
============================= */
router.delete(
  "/sections/:id",
  authenticate,
  async (req, res, next) => {
    const section = await Section.findById(req.params.id);
    if (!section) return res.sendStatus(404);

    req.params.id = String(section.course);
    next();
  },
  canEditCourse,
  async (req, res) => {
    const sectionId = req.params.id;

    await Exam.deleteMany({ section: sectionId });   // ✅ exam
    await Lesson.deleteMany({ section: sectionId }); // ✅ lesson
    await Section.findByIdAndDelete(sectionId);

    res.json({ message: "Section deleted" });
  }
);

export default router;
