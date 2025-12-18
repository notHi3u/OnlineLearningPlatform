import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },

    order: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // 🔥 auto-calc từ ExamQuestion
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ⏱️ thời gian làm bài (phút), null = không giới hạn
    durationMinutes: {
      type: Number,
      min: 1,
    },

    // 🎯 % điểm tối thiểu để đạt
    passPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// mỗi section chỉ có 1 exam ở mỗi order
ExamSchema.index({ section: 1, order: 1 });

export default mongoose.model("Exam", ExamSchema);
