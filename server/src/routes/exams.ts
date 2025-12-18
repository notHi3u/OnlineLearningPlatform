import express from "express";
import Exam from "../models/Exam.ts";
import Section from "../models/Section.ts";
import ExamQuestion from "../models/ExamQuestion.ts";
import { authenticate } from "../middlewares/auth.ts";
import { canEditCourse } from "../middlewares/coursePermission.ts";

const router = express.Router();

/* ================= HELPER ================= */
// inject courseId vào req.params.id để canEditCourse dùng
async function injectCourseId(req: any, _res: any, next: any) {
  try {
    let sectionId =
      req.body.section ||
      req.params.sectionId ||
      (req.params.id
        ? (await Exam.findById(req.params.id))?.section
        : null);

    if (!sectionId) return next();

    const section = await Section.findById(sectionId);
    if (!section) return next();

    // ✅ ĐÚNG: gắn vào req.courseId
    req.courseId = String(section.course);
    next();
  } catch {
    next();
  }
}

/* ================= CREATE ================= */
// POST /api/exams
router.post(
  "/",
  authenticate,
  injectCourseId,
  canEditCourse,
  async (req, res) => {
    const {
      section,
      title,
      description,
      durationMinutes,
      passPercent,
    } = req.body;

    const last = await Exam.find({ section })
      .sort({ order: -1 })
      .limit(1);

    const order = last.length ? last[0].order + 1 : 1;

    const exam = await Exam.create({
      section,
      title,
      description,
      order,
      durationMinutes: durationMinutes ?? null,
      passPercent: passPercent ?? 50,
    });

    res.status(201).json(exam);
  }
);


/* ================= READ ================= */
// GET /api/exams/section/:sectionId
router.get("/section/:sectionId", async (req, res) => {
  const exams = await Exam.find({
    section: req.params.sectionId,
  }).sort({ order: 1 });

  res.json(exams);
});

// GET /api/exams/:id  (exam + questions – dùng cho EDIT)
router.get(
  "/:id",
  authenticate,
  injectCourseId,
  canEditCourse,
  async (req, res) => {
    const exam = await Exam.findById(req.params.id).lean();
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = await ExamQuestion.find({
      exam: exam._id,
    })
      .sort({ order: 1 })
      .lean();

      res.json({
        id: exam._id,
        title: exam.title,
        description: exam.description,
        totalScore: exam.totalScore,
        durationMinutes: exam.durationMinutes,
        passPercent: exam.passPercent,
        questions: questions.map(q => ({
          id: q._id,
          question: q.question,
          order: q.order,
          options: q.options,
          score: q.score,
        })),
      });
  }
);

/* ================= QUESTIONS ================= */
// ✅ GET /api/exams/:id/questions  (🔥 FRONTEND ĐANG GỌI)
router.get(
  "/:id/questions",
  authenticate,
  injectCourseId,
  async (req, res) => {
    const questions = await ExamQuestion.find({
      exam: req.params.id,
    })
      .sort({ order: 1 })
      .lean();

    res.json(
      questions.map(q => ({
        id: q._id,
        question: q.question,
        order: q.order,
        options: q.options,
        score: q.score,
      }))
    );
  }
);

// PUT /api/exams/:id/questions
router.put(
  "/:id/questions",
  authenticate,
  injectCourseId,
  canEditCourse,
  async (req, res) => {
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res
        .status(400)
        .json({ message: "Invalid questions payload" });
    }

    await ExamQuestion.deleteMany({ exam: req.params.id });

    await ExamQuestion.insertMany(
      questions.map((q: any, index: number) => ({
        exam: req.params.id,
        order: index + 1,
        question: q.question,
        options: q.options,
        score: q.score ?? 1,
      }))
    );

    res.json({ message: "Questions saved" });
  }
);

/* ================= UPDATE ================= */
// PUT /api/exams/:id
router.put(
  "/:id",
  authenticate,
  injectCourseId,
  canEditCourse,
  async (req, res) => {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        durationMinutes: req.body.durationMinutes ?? null,
        passPercent: req.body.passPercent ?? 50,
      },
      { new: true }
    );    

    if (!exam) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(exam);
  }
);

/* ================= DELETE ================= */
// DELETE /api/exams/:id
router.delete(
  "/:id",
  authenticate,
  injectCourseId,
  canEditCourse,
  async (req, res) => {
    await ExamQuestion.deleteMany({ exam: req.params.id });
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  }
);

export default router;
