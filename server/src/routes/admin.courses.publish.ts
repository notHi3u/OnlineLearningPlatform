import express from "express";
import Course from "../models/Course.ts";
import { authenticate } from "../middlewares/auth.ts";

const router = express.Router();

/* ================= GUARD ================= */
function requireAdmin(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
}

/* ================= APPROVE ================= */
// PUT /api/admin/courses/:id/approve
router.put(
  "/courses/:id/approve",
  authenticate,
  requireAdmin,
  async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.publishStatus = "approved";
    course.isPublished = true;
    course.publishApprovedAt = new Date();

    await course.save();

    res.json({ message: "Course approved" });
  }
);

/* ================= DENY ================= */
// PUT /api/admin/courses/:id/deny
router.put(
  "/courses/:id/deny",
  authenticate,
  requireAdmin,
  async (req, res) => {
    const { reason } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.publishStatus = "denied";
    course.isPublished = false;
    course.publishDeniedAt = new Date();
    course.publishDeniedReason = reason || "";

    await course.save();

    res.json({ message: "Course denied" });
  }
);

export default router;
