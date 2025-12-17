import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Section", SectionSchema);
