// server/src/routes/user.exam.ts
import express from "express";
import { authenticate } from "../middlewares/auth.ts";

import UserExam from "../models/UserExam.ts";
import ExamQuestion from "../models/ExamQuestion.ts";
import Exam from "../models/Exam.ts";
import Section from "../models/Section.ts";
import { checkExamPassed } from "../utils/examProgress.ts";
import { markItemCompleted } from "../services/courseProgress.service.ts";
import { getPaginationParams, buildPaginatedResult } from "../utils/pagination.ts";


const router = express.Router();

/* ================= HELPERS ================= */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ================= EXAM HISTORY =================
router.get("/history", authenticate, async (req, res) => {
    const userId = req.user!.id;
    const { page, limit, skip } = getPaginationParams(req.query);
    const search = (req.query.search as string)?.trim()?.toLowerCase() || "";
  
    try {
      const [records, total] = await Promise.all([
        UserExam.find({
          user: userId,
          status: "submitted",
        })
          .populate({ path: "course", select: "title" })
          .populate({ path: "exam", select: "title" })
          .select(
            "course exam attempt achievedScore totalScore passPercent submittedAt"
          )
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
  
        UserExam.countDocuments({
          user: userId,
          status: "submitted",
        }),
      ]);
  
      let items = records.map(h => {
        const percent = h.totalScore
          ? (h.achievedScore / h.totalScore) * 100
          : 0;
  
        const course = h.course as any;
        const exam = h.exam as any;
  
        return {
          courseId: course?._id,
          courseTitle: course?.title || "Unknown Course",
  
          examId: exam?._id,
          examTitle: exam?.title || "Exam",
  
          attempt: h.attempt,
          achievedScore: h.achievedScore,
          totalScore: h.totalScore,
  
          percent: Math.round(percent),
          passPercent: h.passPercent,
          passed: percent >= (h.passPercent || 50),
  
          submittedAt: h.submittedAt,
        };
      });
  
      // optional FE search filter
      if (search) {
        items = items.filter(x =>
          (x.courseTitle || "").toLowerCase().includes(search) ||
          (x.examTitle || "").toLowerCase().includes(search)
        );
      }
  
      return res.json(buildPaginatedResult(items, page, limit, total));
    } catch (err) {
      console.error("User exam history failed:", err);
      return res.status(500).json({ message: "Failed to load history" });
    }
  });
  

// ================= ADMIN EXAM HISTORY (ALL USERS, PAGINATED) =================
router.get("/history/all", authenticate, async (req, res) => {
    const authUser = req.user!;
  
    if (authUser.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
  
    const { page, limit, skip } = getPaginationParams(req.query);
    const search = (req.query.search as string)?.trim()?.toLowerCase() || "";
  
    const filter: any = {
      status: "submitted",
    };
  
    try {
      const [records, total] = await Promise.all([
        UserExam.find(filter)
          .populate({ path: "course", select: "title" })
          .populate({ path: "exam", select: "title" })
          .populate({ path: "user", select: "name email" })
          .select(
            "course exam user attempt achievedScore totalScore passPercent submittedAt"
          )
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
  
        UserExam.countDocuments(filter),
      ]);
  
      let result = records.map(h => {
        const percent = h.totalScore
          ? (h.achievedScore / h.totalScore) * 100
          : 0;
  
        const course = h.course as any;
        const exam = h.exam as any;
        const user = h.user as any;
  
        return {
          userId: user?._id,
          userName: user?.name || user?.email || "Unknown User",
  
          courseId: course?._id,
          courseTitle: course?.title || "Unknown Course",
  
          examId: exam?._id,
          examTitle: exam?.title || "Exam",
  
          attempt: h.attempt,
          achievedScore: h.achievedScore,
          totalScore: h.totalScore,
  
          percent: Math.round(percent),
          passPercent: h.passPercent,
          passed: percent >= (h.passPercent || 50),
  
          submittedAt: h.submittedAt,
        };
      });
  
      // 🔍 optional search (safe)
      if (search) {
        result = result.filter(r =>
          (r.userName || "").toLowerCase().includes(search) ||
          (r.courseTitle || "").toLowerCase().includes(search) ||
          (r.examTitle || "").toLowerCase().includes(search)
        );
      }
  
      return res.json(buildPaginatedResult(result, page, limit, total));
    } catch (err) {
      console.error("Admin exam history failed:", err);
      return res
        .status(500)
        .json({ message: "Failed to load exam history" });
    }
  });
  

/* ================= TAKE EXAM ================= */
// GET /api/user-exams/:id/take
router.get("/:id/take", authenticate, async (req, res) => {
    const userId = req.user!.id;
    const examId = req.params.id;

    const lastAttempt = await UserExam.findOne({
        user: userId,
        exam: examId,
    })
        .sort({ attempt: -1 })
        .select("attempt")
        .lean();

    const attempt = lastAttempt ? lastAttempt.attempt + 1 : 1;

    const exam = await Exam.findById(examId)
        .select("section durationMinutes passPercent")
        .lean();

    if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
    }

    const questions = await ExamQuestion.find({ exam: examId }).lean();
    if (!questions.length) {
        return res.status(400).json({ message: "Exam has no questions" });
    }

    const shuffled = shuffle(questions);
    const questionOrder = shuffled.map(q => q._id);

    const optionOrderMap: Record<string, number[]> = {};
    shuffled.forEach(q => {
        optionOrderMap[String(q._id)] = shuffle(
            q.options.map((_, i) => i)
        );
    });

    const totalScore = shuffled.reduce(
        (sum, q) => sum + (q.score || 0),
        0
    );

    const section = await Section.findById(exam.section)
        .select("course")
        .lean();

    const userExam = await UserExam.create({
        user: userId,
        exam: examId,
        course: section?.course,
        attempt,
        questionOrder,
        optionOrderMap,
        totalScore,
        durationMinutes: exam.durationMinutes ?? 0,
        passPercent: exam.passPercent ?? 50,
        status: "in_progress",
        startedAt: new Date(),
    });

    res.json(userExam);
});

/* ================= SUBMIT EXAM ================= */
// POST /api/user-exams/:id/submit
router.post("/:id/submit", authenticate, async (req, res) => {
    const userId = req.user!.id;
    const examId = req.params.id;
    const { attempt, answers } = req.body;

    const userExam = await UserExam.findOne({
        user: userId,
        exam: examId,
        attempt,
        status: "in_progress",
    });

    if (!userExam) {
        return res.status(400).json({ message: "Invalid attempt" });
    }

    let achievedScore = 0;
    const resultAnswers: any[] = [];

    for (const ans of answers || []) {
        const inExam = userExam.questionOrder.some(
            qid => String(qid) === String(ans.questionId)
        );
        if (!inExam) continue;

        const q = await ExamQuestion.findOne({
            _id: ans.questionId,
            exam: examId,
        }).lean();

        if (!q) continue;

        const correctIndexes = q.options
            .map((o, i) => (o.isCorrect ? i : -1))
            .filter(i => i !== -1)
            .sort();

        const selected = [...(ans.selectedOptionIndexes || [])].sort();

        const isCorrect =
            JSON.stringify(correctIndexes) === JSON.stringify(selected);

        const score = isCorrect ? q.score : 0;
        achievedScore += score;

        resultAnswers.push({
            question: q._id,
            selectedOptionIndexes: selected,
            isCorrect,
            score,
        });
    }

    userExam.set("answers", resultAnswers);
    userExam.achievedScore = achievedScore;
    userExam.status = "submitted";
    userExam.submittedAt = new Date();

    await userExam.save();

    /* ================= EXAM PROGRESS ================= */
    const passed = await checkExamPassed({
        userId,
        examId,
        courseId: String(userExam.course),
    });

    if (passed) {
        await markItemCompleted({
            userId,
            courseId: String(userExam.course),
            itemType: "exam",
            itemId: examId,
        });
    }

    return res.json({
        attempt: userExam.attempt,
        achievedScore,
        totalScore: userExam.totalScore,
        passPercent: userExam.passPercent,
        passed,
    });
});

/* ================= ACTIVE / RESUME EXAM ================= */
// GET /api/user-exams/:id/active
router.get("/:id/active", authenticate, async (req, res) => {
    const userId = req.user!.id;
    const examId = req.params.id;

    let userExam = await UserExam.findOne({
        user: userId,
        exam: examId,
        status: "in_progress",
    });

    if (!userExam) {
        const lastAttempt = await UserExam.findOne({
            user: userId,
            exam: examId,
        })
            .sort({ attempt: -1 })
            .select("attempt")
            .lean();

        const attempt = lastAttempt ? lastAttempt.attempt + 1 : 1;

        const exam = await Exam.findById(examId)
            .select("section durationMinutes passPercent")
            .lean();

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        const questions = await ExamQuestion.find({ exam: examId }).lean();
        if (!questions.length) {
            return res.status(400).json({ message: "Exam has no questions" });
        }

        const shuffled = shuffle(questions);

        const optionOrderMap: Record<string, number[]> = {};
        shuffled.forEach(q => {
            optionOrderMap[String(q._id)] = shuffle(
                q.options.map((_, i) => i)
            );
        });

        const section = await Section.findById(exam.section)
            .select("course")
            .lean();

        userExam = await UserExam.create({
            user: userId,
            exam: examId,
            course: section?.course,
            attempt,
            questionOrder: shuffled.map(q => q._id),
            optionOrderMap,
            totalScore: shuffled.reduce((s, q) => s + q.score, 0),
            durationMinutes: exam.durationMinutes ?? 0,
            passPercent: exam.passPercent ?? 50,
            status: "in_progress",
            startedAt: new Date(),
        });
    }

    /* ===== BUILD UI QUESTIONS (FIX MAP) ===== */
    const questions = await ExamQuestion.find({
        _id: { $in: userExam.questionOrder },
    }).lean();

    const questionMap = new Map(
        questions.map(q => [String(q._id), q])
    );

    const optionMap: Record<string, number[]> =
        userExam.optionOrderMap instanceof Map
            ? Object.fromEntries(userExam.optionOrderMap)
            : userExam.optionOrderMap
                ? userExam.optionOrderMap
                : {};

    const resultQuestions = userExam.questionOrder.map(qid => {
        const q = questionMap.get(String(qid))!;
        const order = optionMap[String(qid)];

        return {
            id: q._id,
            question: q.question,
            options: order.map(i => ({
                index: i,
                text: q.options[i].text,
            })),
        };
    });

    res.json({
        examId,
        course: userExam.course,
        attempt: userExam.attempt,
        totalScore: userExam.totalScore,
        durationMinutes: userExam.durationMinutes,
        passPercent: userExam.passPercent,
        questions: resultQuestions,
    });
});

export default router;
