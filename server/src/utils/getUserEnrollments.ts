// utils/getUserEnrollments.ts
import Enrollment from "../models/Enrollment.ts";

export const getUserEnrollments = async (userId: string) => {
  return Enrollment.find({ user: userId })
    .populate({
      path: "course",
      select: "title thumbnail publishStatus teacher",
      populate: {
        path: "teacher",
        select: "name email",
      },
    })
    .sort({ enrolledAt: -1 });
};
