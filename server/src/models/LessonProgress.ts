// src/models/LessonProgress.ts
import mongoose from "mongoose";

const LessonProgressSchema = new mongoose.Schema(
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
    itemType: {
      type: String,
      enum: ["lesson", "exam"],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    completedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true, versionKey: false }
);

// 1 user chỉ hoàn thành 1 item 1 lần
LessonProgressSchema.index(
  { user: 1, course: 1, itemType: 1, itemId: 1 },
  { unique: true }
);

export default mongoose.model("LessonProgress", LessonProgressSchema);
