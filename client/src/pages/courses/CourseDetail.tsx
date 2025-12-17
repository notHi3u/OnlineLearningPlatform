import React, { useEffect, useState } from "react";
import { api } from "../../api/http";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useDialog } from "../../components/shared/DialogProvider";
import CourseContent from "../../components/course/CourseContent";

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  teacher?: {
    _id: string;
    name: string;
    email: string;
  };
  isPublished: boolean;
}

const CourseDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showDialog } = useDialog();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [enrolled, setEnrolled] = useState(false);
  const [loadingEnroll, setLoadingEnroll] = useState(false);

  /* ================= LOAD COURSE ================= */
  const loadCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHECK ENROLLMENT ================= */
  const loadEnrollment = async () => {
    if (!user?.id) return;

    try {
      const res = await api.get(`/enroll/user/${user.id}`, {
        params: { page: 1, limit: 100 },
      });

      const isEnrolled = res.data.items?.some(
        (e: any) => e.course?._id === id
      );

      setEnrolled(!!isEnrolled);
    } catch (err) {
      console.error("Check enroll error:", err);
    }
  };

  useEffect(() => {
    loadCourse();
    loadEnrollment();
  }, [id]);

  /* ================= PERMISSION ================= */
  const isOwner =
    user?.role === "teacher" &&
    course?.teacher &&
    course.teacher._id === user.id;

  const canEnroll =
    user &&
    user.role === "student";

  const canEdit =
    user &&
    (user.role === "admin" ||
      (user.role === "teacher" && isOwner));

  /* ================= ACTIONS ================= */
  const handleEnroll = async () => {
    if (!user) return navigate("/login");

    setLoadingEnroll(true);
    try {
      await api.post("/enroll", {
        courseId: id,
        userId: user.id,
        role: user.role,
      });

      showDialog({
        title: "Success",
        message: "You are now enrolled in this course!",
        variant: "success",
      });

      setEnrolled(true);
    } catch (err: any) {
      showDialog({
        title: "Error",
        message: err?.response?.data?.message || "Failed to enroll.",
        variant: "error",
      });
    } finally {
      setLoadingEnroll(false);
    }
  };

  const handleUnenroll = async () => {
    showDialog({
      title: "Confirm",
      message: "Are you sure you want to unenroll?",
      variant: "warning",
    });

    try {
      await api.delete("/enroll", {
        data: { userId: user?.id, courseId: id },
      });

      showDialog({
        title: "Unenrolled",
        message: "You have been unenrolled.",
        variant: "info",
      });

      setEnrolled(false);
    } catch (err) {
      showDialog({
        title: "Error",
        message: "Failed to unenroll.",
        variant: "error",
      });
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center mt-20">
        <p>Course not found.</p>
        <button
          onClick={() => navigate("/courses")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate("/courses")}
        className="mb-6 text-indigo-600 hover:underline"
      >
        ← Back to Courses
      </button>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        {/* Thumbnail */}
        <div className="w-full aspect-video bg-gray-200 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No Thumbnail
            </div>
          )}
        </div>


        {/* Content */}
        <div className="p-6 space-y-4">
          <h1 className="text-3xl font-bold">{course.title}</h1>

          <div className="flex items-center gap-3">
            {/* ✅ chỉ owner teacher mới thấy Published/Draft */}
            {(isOwner || user?.role === "admin") && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  course.isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {course.isPublished ? "Published" : "Draft"}
              </span>
            )}

            <span className="text-sm text-gray-600">
              Teacher:{" "}
              <span className="font-medium">
                {course.teacher?.name}
              </span>
            </span>
          </div>

          <p className="text-gray-700 text-lg">
            {course.description || "No description provided."}
          </p>

          {/* ACTIONS */}
          <div className="pt-4 flex gap-3">
            {canEnroll && (
              enrolled ? (
                <button
                  onClick={handleUnenroll}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Unenroll
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={loadingEnroll}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loadingEnroll ? "Enrolling..." : "Enroll"}
                </button>
              )
            )}

            {canEdit && (
              <button
                onClick={() => navigate(`/courses/${course._id}/edit`)}
                className="px-5 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
              >
                Edit Course
              </button>
            )}
          </div>
          <CourseContent
           courseId={course._id}
           enrolled={enrolled}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
