import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import type { Types } from "mongoose";
import LessonProgress from "../models/LessonProgress.ts";
import UserExam from "../models/UserExam.ts";

/**
 * Enroll user to course
 * - No transaction (Mongo standalone compatible)
 * - Unique index (user + course) prevents duplicate
 */
export const enrollUser = async ({
  userId,
  courseId,
  role = "student",
}: {
  userId: string;
  courseId: string;
  role?: "student" | "teacher" | "assistant";
}) => {
  // check course exists
  const course = await Course.findById(courseId).select("_id teacher");
  if (!course) {
    throw new Error("Course not found");
  }

  // teacher cannot enroll their own course
  if (role === "teacher" && course.teacher.toString() === userId) {
    throw new Error("Teacher cannot enroll their own course");
  }

  const enrollment = await Enrollment.create({
    user: userId,
    course: courseId,
    role,
  });

  return {
    message: "Enrolled successfully",
    enrollment,
  };
};

export async function unenrollUser({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) {
  /* 1️⃣ remove enrollment */
  await Enrollment.deleteOne({
    user: userId,
    course: courseId,
  });

  /* 2️⃣ remove lesson + exam progress */
  await LessonProgress.deleteMany({
    user: userId,
    course: courseId,
  });

  /* 3️⃣ remove all exam attempts */
  await UserExam.deleteMany({
    user: userId,
    course: courseId,
  });

  return {
    message: "Unenrolled successfully. Progress cleared.",
  };
}

export const getEnrollmentsByUser = async (
  userId: string,
  { page, limit }: { page: number; limit: number }
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Enrollment.find({ user: userId })
      .populate("course")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Enrollment.countDocuments({ user: userId }),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const getEnrollmentsByCourse = async (
  courseId: string,
  { page, limit }: { page: number; limit: number }
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Enrollment.find({ course: courseId })
      .populate("user", "name email role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Enrollment.countDocuments({ course: courseId }),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get course students with their progress and exam scores
 */
export const getCourseStudents = async (courseId: string) => {
  // Get all enrollments for the course
  const enrollments = await Enrollment.find({ course: courseId })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  // Get all exams in this course
  const Section = (await import("../models/Section.ts")).default;
  const Exam = (await import("../models/Exam.ts")).default;
  
  const sections = await Section.find({ course: courseId }).select("_id").lean();
  const sectionIds = sections.map(s => s._id);
  
  const exams = await Exam.find({ section: { $in: sectionIds } })
    .select("_id title")
    .lean();
  
  const examMap = new Map(exams.map(e => [String(e._id), e]));

  // Get all lesson progress for students in this course
  const LessonProgress = (await import("../models/LessonProgress.ts")).default;
  const UserExam = (await import("../models/UserExam.ts")).default;

  const userIds = enrollments.map(e => e.user._id);
  
  const [lessonProgress, examAttempts] = await Promise.all([
    LessonProgress.find({ course: courseId, user: { $in: userIds } }).lean(),
    UserExam.find({ 
      course: courseId, 
      user: { $in: userIds },
      status: "submitted"
    }).lean()
  ]);

  // Group lesson progress by user (itemType = lesson)
  const lessonProgressByUser = new Map<string, Set<string>>();
  lessonProgress.forEach(lp => {
    if (lp.itemType === "lesson") {
      const userId = String(lp.user);
      if (!lessonProgressByUser.has(userId)) {
        lessonProgressByUser.set(userId, new Set());
      }
      lessonProgressByUser.get(userId)!.add(String(lp.itemId));
    }
  });

  // Group exam attempts by user and exam, keep highest score
  const examScoresByUser = new Map<string, Map<string, { score: number; percent: number }>>();
  examAttempts.forEach(attempt => {
    const userId = String(attempt.user);
    const examId = String(attempt.exam);
    const percent = attempt.totalScore 
      ? Math.round((attempt.achievedScore / attempt.totalScore) * 100)
      : 0;
    
    if (!examScoresByUser.has(userId)) {
      examScoresByUser.set(userId, new Map());
    }
    
    const current = examScoresByUser.get(userId)!.get(examId);
    if (!current || percent > current.percent) {
      examScoresByUser.get(userId)!.set(examId, { score: attempt.achievedScore, percent });
    }
  });

  // Get total lessons count for progress calculation
  const Lesson = (await import("../models/Lesson.ts")).default;
  const totalLessons = await Lesson.countDocuments({ section: { $in: sectionIds } });

  // Build result
  const result = enrollments.map(enrollment => {
    const user = enrollment.user as any;
    const userId = String(user._id);
    const completedLessons = lessonProgressByUser.get(userId)?.size || 0;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    const examScores = examScoresByUser.get(userId);
    const examResults = exams.map(exam => {
      const examScore = examScores?.get(String(exam._id));
      return {
        examId: exam._id,
        examTitle: exam.title,
        score: examScore?.score || 0,
        percent: examScore?.percent || 0,
      };
    });

    return {
      enrollmentId: enrollment._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      enrolledAt: enrollment.enrolledAt,
      progress,
      completedLessons,
      totalLessons,
      exams: examResults,
    };
  });

  return result;
};
