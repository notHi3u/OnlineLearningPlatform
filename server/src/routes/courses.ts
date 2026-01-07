import express, { type Request, type Response } from "express";
import type { Express } from "express";
import multer from "multer";
import mongoose from "mongoose";
import Course from "../models/Course.ts";
import cloudinary from "../config/cloudinary.ts";
import {
  getPaginationParams,
  buildPaginatedResult,
} from "../utils/pagination.ts";
import { canEditCourse } from "../middlewares/coursePermission.ts";
import {authenticate, authenticateOptional} from "../middlewares/auth.ts";
import { queryFilter } from "../utils/queryFilter.ts";
import { getCourseStudents } from "../services/enrollment.ts";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ==============================
   Cloudinary helper
================================ */
const uploadToCloudinary = async (file: Express.Multer.File) => {
  const base64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "olp_thumbnails",
    transformation: [{ width: 600, height: 338, crop: "fill" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/* ==============================
   GET /api/courses
   public (guest ok)
================================ */
router.get("/", authenticateOptional, async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const user = req.user;
    const role = user?.role;

    const filter = await queryFilter(req.query, {
      // filter = ?publishStatus=pending
      exactFields: ["publishStatus", "teacher", "isPublished"],

      // search = ?q=react
      searchableFields: ["title", "description"],

      // search teacher name
      populateSearch: {
        model: "User",
        field: "teacher",
        searchField: "name",
      },

      // default rule
      defaultFilter:
        !user || role === "student"
          ? { isPublished: true }
          : {},
    });

    const [items, total] = await Promise.all([
      Course.find(filter)
        .populate("teacher", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(filter),
    ]);

    return res.json(buildPaginatedResult(items, page, limit, total));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to get courses" });
  }
});

/* ==============================
   GET /api/courses/:id
   auth optional (for rule)
================================ */
router.get("/:id", authenticateOptional, async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "teacher",
      "name email role"
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const user = req.user;
    const role = user?.role;
    const userId = user?.id;

    const isOwner =
      role === "teacher" &&
      String(course.teacher?._id) === String(userId);

    if (!course.isPublished) {
      if (!user || role === "student") {
        return res.status(403).json({ message: "Course not published" });
      }

      if (role === "teacher" && !isOwner) {
        return res.status(403).json({ message: "Course not published" });
      }
      // admin / owner ok
    }

    return res.json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to get course" });
  }
});

/* ==============================
   POST /api/courses
   teacher / admin
================================ */
router.post(
  "/",
  authenticate,
  upload.single("thumbnail"),
  async (req: Request, res: Response) => {
    try {
      const { title, description, isPublished } = req.body;
      const user = req.user!;

      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      if (user.role !== "teacher" && user.role !== "admin") {
        return res.sendStatus(403);
      }

      let thumbnail;
      let thumbnailPublicId;

      if (req.file) {
        const img = await uploadToCloudinary(req.file);
        thumbnail = img.url;
        thumbnailPublicId = img.publicId;
      }

      const course = await Course.create({
        title,
        description,
        teacher: user.id,
        isPublished: false,
        publishStatus: "draft",
        thumbnail,
        thumbnailPublicId,
      });

      return res.status(201).json({ message: "Course created", course });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to create course" });
    }
  }
);

/* ==============================
   PUT /api/courses/:id
================================ */
router.put(
  "/:id",
  authenticate,
  upload.single("thumbnail"), // ✅ multer phải chạy trước
  canEditCourse,
  async (req: Request, res: Response) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) return res.sendStatus(404);

      if (req.file) {
        if (course.thumbnailPublicId) {
          await cloudinary.uploader.destroy(course.thumbnailPublicId);
        }
        const img = await uploadToCloudinary(req.file);
        course.thumbnail = img.url;
        course.thumbnailPublicId = img.publicId;
      }

      if (req.body.title !== undefined) course.title = req.body.title;
      if (req.body.description !== undefined)
        course.description = req.body.description;
      if (req.body.isPublished !== undefined)
        course.isPublished =
          req.body.isPublished === "true" || req.body.isPublished === true;

      await course.save();
      return res.json({ message: "Course updated", course });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update course" });
    }
  }
);

/* ==============================
   DELETE /api/courses/:id
================================ */
router.delete(
  "/:id",
  authenticate,
  canEditCourse,
  async (req: Request, res: Response) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) return res.sendStatus(404);

      if (course.thumbnailPublicId) {
        await cloudinary.uploader.destroy(course.thumbnailPublicId);
      }

      await course.deleteOne();
      return res.json({ message: "Course deleted" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to delete course" });
    }
  }
);

/* ==============================
   PUT /api/courses/:id/request-publish
   teacher request admin approve
================================ */
router.put(
  "/:id/request-publish",
  authenticate,
  canEditCourse,
  async (req: Request, res: Response) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // ❌ đã approved thì không request nữa
      if (course.publishStatus === "approved") {
        return res
          .status(400)
          .json({ message: "Course already approved" });
      }

      course.publishStatus = "pending";
      course.isPublished = false;

      // optional: reset deny info
      (course as any).publishDeniedReason = undefined;
      (course as any).publishDeniedAt = undefined;

      await course.save();

      return res.json({
        message: "Publish request sent",
        publishStatus: course.publishStatus,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Failed to request publish" });
    }
  }
);

/* ==============================
   PUT /api/courses/:id/set-draft
   owner / admin: approved -> draft
================================ */
router.put(
  "/:id/set-draft",
  authenticate,
  canEditCourse,
  async (req: Request, res: Response) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.publishStatus !== "approved") {
        return res.status(400).json({
          message: "Only approved courses can be set to draft",
        });
      }

      course.publishStatus = "draft";
      course.isPublished = false;

      // optional: clear deny info
      (course as any).publishDeniedReason = undefined;
      (course as any).publishDeniedAt = undefined;

      await course.save();

      return res.json({
        message: "Course set to draft",
        publishStatus: course.publishStatus,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Failed to set course to draft" });
    }
  }
);

/* ==============================
   GET /api/courses/:courseId/students
   teacher (owner) / admin
================================ */
router.get(
  "/:courseId/students",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const user = req.user!;

      // Get course to check ownership
      const course = await Course.findById(courseId).select("teacher").lean();
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check permission: owner or admin
      const isOwner = String(course.teacher) === user.id;
      if (user.role !== "admin" && !isOwner) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const students = await getCourseStudents(courseId);
      return res.json(students);
    } catch (err) {
      console.error("Failed to get course students:", err);
      return res.status(500).json({ message: "Failed to get students" });
    }
  }
);


export default router;
