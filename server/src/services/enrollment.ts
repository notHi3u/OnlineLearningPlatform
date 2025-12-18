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
