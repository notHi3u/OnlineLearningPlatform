// server/src/routes/enrollment.ts
import express from "express";
import {
  enrollUser,
  unenrollUser,
  getEnrollmentsByUser,
  getEnrollmentsByCourse,
} from "../services/enrollment.ts";
import { getPaginationParams } from "../utils/pagination.ts";

const router = express.Router();

/**
 * POST /api/enroll
 * Body: { courseId, userId? (admin), role? }
 * If you have auth middleware that sets req.user.sub (userId), it will be used.
 */
router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    const { courseId, userId: bodyUserId, role } = req.body;

    // prefer authenticated user if exists
    const actorUserId = (req as any).user?.sub || bodyUserId;
    if (!actorUserId) return res.status(400).json({ message: "userId required" });

    if (!courseId) return res.status(400).json({ message: "courseId required" });

    const result = await enrollUser({
      userId: actorUserId,
      courseId,
      role: role || "student",
    });

    return res.status(201).json(result);
  } catch (err: any) {
    console.error("Enroll error:", err);
    if (err?.code === 11000) return res.status(400).json({ message: "Already enrolled" });
    return res.status(500).json({ message: "Failed to enroll", error: err?.message || err });
  }
});

/**
 * DELETE /api/enroll
 * Body or query: { courseId, userId? } - actor can omit userId to act on themself
 */
router.delete("/", async (req: express.Request, res: express.Response) => {
  try {
    const source = req.body && Object.keys(req.body).length ? req.body : req.query;
    const courseId = source.courseId;
    const bodyUserId = source.userId;
    const actorUserId = (req as any).user?.sub || bodyUserId;

    if (!actorUserId || !courseId) return res.status(400).json({ message: "userId and courseId required" });

    const result = await unenrollUser({ userId: actorUserId as string, courseId: courseId as string });
    return res.json(result);
  } catch (err) {
    console.error("Unenroll error:", err);
    return res.status(500).json({ message: "Failed to unenroll" });
  }
});

/**
 * GET /api/enroll/user/:userId?page=&limit=
 */
router.get("/user/:userId", async (req: express.Request, res: express.Response) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const data = await getEnrollmentsByUser(req.params.userId, { page, limit });
    return res.json(data);
  } catch (err) {
    console.error("Get enrollments by user error:", err);
    return res.status(500).json({ message: "Failed to get enrollments" });
  }
});

/**
 * GET /api/enroll/course/:courseId?page=&limit=
 */
router.get("/course/:courseId", async (req: express.Request, res: express.Response) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const data = await getEnrollmentsByCourse(req.params.courseId, { page, limit });
    return res.json(data);
  } catch (err) {
    console.error("Get enrollments by course error:", err);
    return res.status(500).json({ message: "Failed to get course enrollments" });
  }
});

export default router;
