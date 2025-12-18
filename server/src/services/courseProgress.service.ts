import LessonProgress from "../models/LessonProgress.ts";
import Enrollment from "../models/Enrollment.ts";
import { getTotalCourseItems } from "../utils/courseProgress.ts";

export async function markItemCompleted({
  userId,
  courseId,
  itemType,
  itemId,
}: {
  userId: string;
  courseId: string;
  itemType: "lesson" | "exam";
  itemId: string;
}) {
  // 1️⃣ upsert progress
  await LessonProgress.findOneAndUpdate(
    { user: userId, course: courseId, itemType, itemId },
    {},
    { upsert: true }
  );

  // 2️⃣ recalc
  const completedCount = await LessonProgress.countDocuments({
    user: userId,
    course: courseId,
  });

  const totalCount = await getTotalCourseItems(courseId);

  const progress =
    totalCount === 0
      ? 0
      : Math.min(
          100,
          Math.floor((completedCount / totalCount) * 100)
        );

  // 3️⃣ update enrollment
  await Enrollment.findOneAndUpdate(
    { user: userId, course: courseId },
    {
      $set: {
        completedCount,
        totalCount,
        progress,
      },
    }
  );

  return { completedCount, totalCount, progress };
}
