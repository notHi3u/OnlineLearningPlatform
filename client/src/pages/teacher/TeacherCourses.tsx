import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPaginated } from "../../utils/paginationClient";
import type { PaginatedResponse } from "../../types/pagination";
import { api } from "../../api/http";
import { useAuth } from "../../store/auth";
import { useDialog } from "../../components/shared/DialogProvider";

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  isPublished: boolean;
}

const TeacherCourses: React.FC = () => {
  const { user } = useAuth();
  const { showDialog } = useDialog();
  const navigate = useNavigate();

  const [data, setData] = useState<PaginatedResponse<Course> | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const load = async (page: number, q = "") => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await fetchPaginated<Course>("/courses", page, 10, {
        teacherId: user.id,
        ...(q ? { q } : {}),
      });
      setData(result);
    } catch (err) {
      console.error(err);
      showDialog({
        title: "Error",
        message: "Failed to load your courses.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) load(1);
  }, [user?.id]);

  const handleDelete = (id: string) => {
    showDialog({
      title: "Delete course",
      message: "Are you sure you want to delete this course?",
      variant: "warning",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await api.delete(`/courses/${id}`);
          showDialog({
            title: "Deleted",
            message: "Course has been deleted.",
            variant: "success",
          });
          load(data?.page || 1, keyword);
        } catch {
          showDialog({
            title: "Error",
            message: "Failed to delete course.",
            variant: "error",
          });
        }
      },
    });
  };

  if (!user?.id) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        You must be logged in as a teacher.
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading your courses...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* HEADER */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Courses
          </h1>
          <button
            onClick={() => navigate("/courses/new")}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            + Create Course
          </button>
        </div>

        {/* SEARCH (input + button inside) */}
        <div className="w-full max-w-sm relative">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(1, keyword)}
            placeholder="Search your courses..."
            className="w-full px-4 pr-20 py-2 border rounded-full text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => load(1, keyword)}
            className="absolute right-1 top-1/2 -translate-y-1/2
                       px-4 py-1.5 text-xs font-semibold
                       bg-indigo-600 text-white rounded-full
                       hover:bg-indigo-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Course
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((course) => (
              <tr key={course._id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        className="h-12 w-20 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-20 bg-gray-200 rounded" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {course.title}
                      </div>
                      <div className="text-gray-500 line-clamp-1 max-w-xs">
                        {course.description}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      course.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/courses/${course._id}/edit`)}
                    className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="px-3 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {data.items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center space-x-2 mt-6">
        <button
          disabled={data.page === 1}
          onClick={() => load(data.page - 1, keyword)}
          className="px-3 py-1 border rounded text-sm disabled:opacity-40"
        >
          Prev
        </button>

        {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => load(p, keyword)}
            className={`px-3 py-1 border rounded text-sm ${
              p === data.page
                ? "bg-indigo-600 text-white border-indigo-600"
                : "hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          disabled={data.page === data.totalPages}
          onClick={() => load(data.page + 1, keyword)}
          className="px-3 py-1 border rounded text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TeacherCourses;
