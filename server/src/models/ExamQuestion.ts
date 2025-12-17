import mongoose from "mongoose";

/* ================= OPTION ================= */
const ExamOptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/* ================= QUESTION ================= */
const ExamQuestionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },

    // 🔥 backend tự set theo index khi save
    order: {
      type: Number,
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [ExamOptionSchema],
      required: true,
      validate: {
        validator: (opts: any[]) =>
          Array.isArray(opts) &&
          opts.length >= 2 &&
          opts.some(o => o.isCorrect),
        message: "Each question must have at least 2 options and 1 correct answer",
      },
    },

    explanation: {
      type: String,
      trim: true,
    },

    score: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// mỗi exam chỉ có 1 question cho mỗi order
ExamQuestionSchema.index({ exam: 1, order: 1 });

export default mongoose.model("ExamQuestion", ExamQuestionSchema);
