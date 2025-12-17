import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    /* ===== BASIC INFO ===== */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    thumbnail: {
      type: String, // Cloudinary secure_url
    },

    thumbnailPublicId: {
      type: String, // để xoá/update cloudinary
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ===== PUBLISH FLOW (🔥 NEW) ===== */

    // admin mới set isPublished = true
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    publishStatus: {
      type: String,
      enum: ["draft", "pending", "approved", "denied"],
      default: "draft",
      index: true,
    },

    // teacher bấm request publish
    publishRequestAt: {
      type: Date,
    },

    // admin approve
    publishApprovedAt: {
      type: Date,
    },

    // admin deny (có lý do)
    publishDeniedReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ===== INDEX ===== */
CourseSchema.index({ teacher: 1, publishStatus: 1 });
CourseSchema.index({ isPublished: 1 });

export default mongoose.model("Course", CourseSchema);
