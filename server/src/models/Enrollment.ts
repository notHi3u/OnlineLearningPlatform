// models/Enrollment.ts
import mongoose from "mongoose";

export interface IEnrollment {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  role?: "student" | "teacher" | "assistant";

  completedCount: number; // số item đã học
  totalCount: number;     // tổng lesson + exam
  progress: number;       // % (cache)

  enrolledAt?: Date;
}

const EnrollmentSchema = new mongoose.Schema<IEnrollment>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "assistant"],
      default: "student",
    },

    completedCount: {
      type: Number,
      default: 0,
    },

    totalCount: {
      type: Number,
      default: 0,
    },

    progress: {
      type: Number,
      default: 0,
    },

    enrolledAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
