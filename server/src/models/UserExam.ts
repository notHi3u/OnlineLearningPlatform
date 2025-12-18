// server/src/models/UserExam.ts
import mongoose from "mongoose";

/* ================= ANSWER ================= */
const UserExamAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamQuestion",
      required: true,
    },
    selectedOptionIndexes: {
      type: [Number],
      default: [],
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ================= MAIN ================= */
const UserExamSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    attempt: {
      type: Number,
      required: true,
    },

    /* ===== SNAPSHOT ===== */
    questionOrder: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamQuestion",
      },
    ],

    optionOrderMap: {
      type: Map,
      of: [Number],
    },

    answers: [UserExamAnswerSchema],

    totalScore: {
      type: Number,
      default: 0,
    },

    achievedScore: {
      type: Number,
      default: 0,
    },

    // 🔥 ADD 2 FIELD NÀY
    durationMinutes: {
      type: Number,
      default: null,
    },

    passPercent: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["in_progress", "submitted"],
      default: "in_progress",
    },

    startedAt: {
      type: Date,
      default: () => new Date(),
    },

    submittedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* mỗi user có nhiều attempt */
UserExamSchema.index(
  { user: 1, exam: 1, attempt: 1 },
  { unique: true }
);

export default mongoose.model("UserExam", UserExamSchema);
