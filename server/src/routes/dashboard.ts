import { Router, type Request, type Response } from "express";
import Course from "../models/Course.ts";
import Enrollment from "../models/Enrollment.ts";
import User from "../models/User.ts";
import { authenticate } from "../middlewares/auth.ts";

const router = Router();

// Get teacher dashboard stats
router.get("/teacher", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "teacher") {
      return res.status(403).json({ message: "Access denied" });
    }

    const teacherId = req.user.id;

    // Get all courses by teacher
    const courses = await Course.find({ teacher: teacherId });
    
    const stats = {
      totalCourses: courses.length,
      published: courses.filter((c: any) => c.publishStatus === "approved").length,
      pending: courses.filter((c: any) => c.publishStatus === "pending").length,
      draft: courses.filter((c: any) => c.publishStatus === "draft" || c.publishStatus === "denied").length,
      totalStudents: 0,
      recentCourses: [] as any[]
    };

    // Count total students from enrollments
    for (const course of courses) {
      const enrollments = await Enrollment.countDocuments({ course: course._id });
      stats.totalStudents += enrollments;
    }

    // Get recent courses
    stats.recentCourses = courses
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((c: any) => ({
        id: c._id,
        title: c.title,
        status: c.publishStatus,
        students: 0
      }));

    // Get student counts for recent courses
    for (const course of stats.recentCourses) {
      course.students = await Enrollment.countDocuments({ course: course._id });
    }

    res.json(stats);
  } catch (err) {
    console.error("Teacher dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get admin dashboard stats
router.get("/admin", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [
      totalUsers,
      totalCourses,
      pendingCourses,
      enrollments,
      usersByRole,
      coursesByStatus
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Course.countDocuments({ publishStatus: "pending" }),
      Enrollment.countDocuments(),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]),
      Course.aggregate([
        { $group: { _id: "$publishStatus", count: { $sum: 1 } } }
      ])
    ]);

    // Get recent activities
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("email createdAt")
      .lean();

    const recentCourses = await Course.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title publishStatus updatedAt")
      .populate("teacher", "name email")
      .lean();

    res.json({
      stats: {
        totalUsers,
        totalCourses,
        pendingCourses,
        enrollments,
        usersByRole,
        coursesByStatus
      },
      recentActivities: {
        users: recentUsers.map((u: any) => ({
          email: u.email,
          createdAt: u.createdAt
        })),
        courses: recentCourses.map((c: any) => ({
          title: c.title,
          status: c.publishStatus,
          updatedAt: c.updatedAt,
          teacher: c.teacher ? c.teacher.name : "Unknown"
        }))
      }
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student dashboard stats
router.get("/student", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const studentId = req.user.id;

    // Get all enrollments for student
    const enrollments = await Enrollment.find({ user: studentId })
      .populate("course", "title teacher thumbnail")
      .lean();

    const enrolledCourses = enrollments.map((e: any) => ({
      enrollmentId: e._id,
      courseId: e.course,
      title: e.course?.title,
      teacher: e.course?.teacher,
      thumbnail: e.course?.thumbnail,
      progress: e.progress || 0,
      enrolledAt: e.createdAt
    }));

    // Calculate average progress
    const totalProgress = enrolledCourses.reduce((sum: number, c: any) => sum + (c.progress || 0), 0);
    const avgProgress = enrolledCourses.length > 0 
      ? Math.round(totalProgress / enrolledCourses.length) 
      : 0;

    // Get recent enrollments
    const recentEnrollments = enrollments
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    res.json({
      stats: {
        totalEnrolled: enrolledCourses.length,
        averageProgress: avgProgress,
        completedCourses: enrolledCourses.filter((c: any) => c.progress === 100).length,
        inProgressCourses: enrolledCourses.filter((c: any) => c.progress > 0 && c.progress < 100).length
      },
      recentCourses: recentEnrollments.map((e: any) => ({
        id: e.course?._id,
        title: e.course?.title,
        progress: e.progress || 0,
        enrolledAt: e.createdAt
      })),
      allCourses: enrolledCourses
    });
  } catch (err) {
    console.error("Student dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
