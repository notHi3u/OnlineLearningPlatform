import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    thumbnail: String,          // Cloudinary secure_url
    thumbnailPublicId: String,  // để xoá/update

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ===== PUBLISH ===== */
    isPublished: {
      type: Boolean,
      default: false,
    },

    publishStatus: {
      type: String,
      enum: ["draft", "pending", "approved", "denied"],
      default: "draft",
      index: true,
    },

    publishRequestedAt: {
      type: Date,
    },

    publishApprovedAt: {
      type: Date,
    },

    publishDeniedAt: {
      type: Date,
    },

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

export default mongoose.model("Course", CourseSchema);
