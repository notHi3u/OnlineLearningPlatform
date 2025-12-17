import mongoose from "mongoose";

export interface IEnrollment {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  role?: "student" | "teacher" | "assistant";
  progress?: number;
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
    progress: { type: Number, default: 0 },
    enrolledAt: { type: Date, default: () => new Date() },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// user + course unique
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model<IEnrollment>(
  "Enrollment",
  EnrollmentSchema
);

export default Enrollment;
