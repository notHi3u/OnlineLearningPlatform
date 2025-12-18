import UserExam from "../models/UserExam.ts";

export async function checkExamPassed({
  userId,
  examId,
  courseId,
}: {
  userId: string;
  examId: string;
  courseId: string;
}): Promise<boolean> {
  const attempts = await UserExam.find({
    user: userId,
    exam: examId,
    course: courseId,
    status: "submitted",
  }).lean();

  if (!attempts.length) return false;

  const best = attempts.reduce((max, cur) =>
    cur.achievedScore > max.achievedScore ? cur : max
  );

  if (!best.totalScore) return false;

  const percent = (best.achievedScore / best.totalScore) * 100;
  return percent >= best.passPercent;
}
