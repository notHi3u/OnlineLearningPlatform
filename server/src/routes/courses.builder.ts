import express from "express";
import Section from "../models/Section.ts";
import Lesson from "../models/Lesson.ts";
import Exam from "../models/Exam.ts";
import ExamQuestion from "../models/ExamQuestion.ts";
import { authenticate } from "../middlewares/auth.ts";
import { canEditCourse } from "../middlewares/coursePermission.ts";

const router = express.Router();

router.put(
  "/:id/builder",
  authenticate,
  canEditCourse,
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const { sections } = req.body;

      if (!Array.isArray(sections)) {
        return res.status(400).json({ message: "Invalid payload" });
      }

      /* ================= LOAD CURRENT ================= */
      const dbSections = await Section.find({ course: courseId });
      const sectionMap = new Map(dbSections.map(s => [String(s._id), s]));
      const usedSectionIds = new Set<string>();

      /* ================= UPSERT ================= */
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        let sectionId = sec.id;

        /* ===== SECTION ===== */
        if (sectionId && sectionMap.has(sectionId)) {
          await Section.updateOne(
            { _id: sectionId },
            { title: sec.title, order: i + 1 }
          );
        } else {
          const created = await Section.create({
            course: courseId,
            title: sec.title,
            order: i + 1,
          });
          sectionId = created._id.toString();
        }

        usedSectionIds.add(sectionId);

        /* ===== CLEAN OLD CONTENT ===== */
        const oldExams = await Exam.find({ section: sectionId });
        const oldExamIds = oldExams.map(e => e._id);

        await ExamQuestion.deleteMany({ exam: { $in: oldExamIds } });
        await Exam.deleteMany({ section: sectionId });
        await Lesson.deleteMany({ section: sectionId });

        /* ===== INSERT ITEMS ===== */
        const items = Array.isArray(sec.items) ? sec.items : [];

        for (let j = 0; j < items.length; j++) {
          const item = items[j];

          /* ---------- LESSON ---------- */
          if (item.kind === "lesson") {
            await Lesson.create({
              section: sectionId,
              title: item.title,
              type: item.lessonType,
              contentUrl: item.contentUrl,
              order: j + 1,
            });
          }

          /* ---------- EXAM ---------- */
          if (item.kind === "exam") {
            const examDoc = await Exam.create({
              section: sectionId,
              title: item.title,
              description: item.description,
              order: j + 1,
            });

            let totalScore = 0;

            /* ===== SAVE QUESTIONS ===== */
            const questions = Array.isArray(item.questions)
              ? item.questions
              : [];

            for (let k = 0; k < questions.length; k++) {
              const q = questions[k];

              await ExamQuestion.create({
                exam: examDoc._id,
                order: k + 1,
                question: q.question,
                options: q.options.map((o: any) => ({
                  text: o.text,
                  isCorrect: o.isCorrect,
                })),
                score: 1,
              });

              totalScore += 1;
            }

            /* ===== UPDATE TOTAL SCORE ===== */
            if (totalScore > 0) {
              await Exam.updateOne(
                { _id: examDoc._id },
                { totalScore }
              );
            }
          }
        }
      }

      /* ================= DELETE REMOVED SECTIONS ================= */
      await Section.deleteMany({
        course: courseId,
        _id: { $nin: [...usedSectionIds] },
      });

      res.json({ message: "Course content saved" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Builder save failed" });
    }
  }
);

export default router;
