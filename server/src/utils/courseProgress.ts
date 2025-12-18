import Section from "../models/Section.ts";
import Lesson from "../models/Lesson.ts";
import Exam from "../models/Exam.ts";

export const getTotalCourseItems = async (courseId: string) => {
  // 1️⃣ lấy tất cả section của course
  const sections = await Section.find(
    { course: courseId },
    { _id: 1 }
  );

  const sectionIds = sections.map(s => s._id);

  // 2️⃣ đếm lesson theo section
  const lessonCount = await Lesson.countDocuments({
    section: { $in: sectionIds },
  });

  // 3️⃣ exam thì OK vì exam gắn course
  const examCount = await Exam.countDocuments({
    section: { $in: sectionIds },
  });

  return lessonCount + examCount;
};
