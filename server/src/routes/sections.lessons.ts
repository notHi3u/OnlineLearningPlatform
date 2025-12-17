import express from "express";
import Lesson from "../models/Lesson.ts";
import Section from "../models/Section.ts";
import { canEditCourse } from "../middlewares/coursePermission.ts";

const router = express.Router();

/* CREATE LESSON */
router.post("/:sectionId/lessons", canEditCourse, async (req, res) => {
  const { title, type, contentUrl } = req.body;
  const { sectionId } = req.params;

  const last = await Lesson.find({ section: sectionId })
    .sort({ order: -1 })
    .limit(1);

  const order = last.length ? last[0].order + 1 : 1;

  const lesson = await Lesson.create({
    section: sectionId,
    title,
    type,
    contentUrl,
    order,
  });

  res.status(201).json(lesson);
});

/* GET LESSONS */
router.get("/:sectionId/lessons", async (req, res) => {
  const lessons = await Lesson.find({ section: req.params.sectionId })
    .sort({ order: 1 });

  res.json(lessons);
});

/* UPDATE LESSON */
router.put("/lessons/:id", canEditCourse, async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(lesson);
});

// PUT /api/courses/lessons/move
router.put("/lessons/move", canEditCourse, async (req, res) => {
    const { lessonId, fromSectionId, toSectionId, toIndex } = req.body;
  
    if (!lessonId || !fromSectionId || !toSectionId || toIndex === undefined) {
      return res.status(400).json({ message: "Invalid payload" });
    }
  
    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.section.toString() !== fromSectionId) {
      return res.status(404).json({ message: "Lesson not found in source section" });
    }
  
    /* =========================
       PHASE 1 – REORDER SOURCE
    ========================= */
    const sourceLessons = await Lesson.find({
      section: fromSectionId,
      _id: { $ne: lessonId },
    }).sort({ order: 1 });
  
    await Lesson.bulkWrite(
      sourceLessons.map((l, i) => ({
        updateOne: {
          filter: { _id: l._id },
          update: { order: -(i + 1) },
        },
      }))
    );
  
    await Lesson.bulkWrite(
      sourceLessons.map((l, i) => ({
        updateOne: {
          filter: { _id: l._id },
          update: { order: i + 1 },
        },
      }))
    );
  
    /* =========================
       PHASE 2 – MOVE LESSON
    ========================= */
    await Lesson.updateOne(
      { _id: lessonId },
      {
        section: toSectionId,
        order: -(toIndex + 1),
      }
    );
  
    /* =========================
       PHASE 3 – REORDER TARGET
    ========================= */
    const targetLessons = await Lesson.find({
      section: toSectionId,
    }).sort({ order: 1 });
  
    const reordered = [
      ...targetLessons.slice(0, toIndex),
      { _id: lessonId },
      ...targetLessons.slice(toIndex),
    ];
  
    await Lesson.bulkWrite(
      reordered.map((l: any, i: number) => ({
        updateOne: {
          filter: { _id: l._id },
          update: { order: i + 1 },
        },
      }))
    );
  
    res.json({ message: "Lesson moved successfully" });
  });  

/* DELETE LESSON */
router.delete("/lessons/:id", canEditCourse, async (req, res) => {
  await Lesson.findByIdAndDelete(req.params.id);
  res.json({ message: "Lesson deleted" });
});

export default router;
