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
  publishStatus: "denied";
  teacher?: {
    _id: string;
    name: string;
    email: string;
  };
}

const AdminDeniedCourses: React.FC = () => {
  const { user } = useAuth();
  const { showDialog } = useDialog();
  const navigate = useNavigate();

  const [data, setData] =
    useState<PaginatedResponse<Course> | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const load = async (page: number, q = "") => {
    setLoading(true);
    try {
      const result = await fetchPaginated<Course>(
        "/courses",
        page,
        10,
        {
          publishStatus: "denied",
          ...(q ? { q } : {}),
        }
      );
      setData(result);
    } catch {
      showDialog({
        title: "Error",
        message: "Failed to load denied courses.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") load(1);
  }, [user?.role]);

  /* ================= ACTIONS ================= */

  const handleApprove = (id: string) => {
    showDialog({
      title: "Approve course",
      message: "Approve this denied course?",
      variant: "warning",
      confirmLabel: "Approve",
      onConfirm: async () => {
        await api.put(`/admin/courses/${id}/approve`);
        showDialog({
          title: "Approved",
          message: "Course approved successfully.",
          variant: "success",
        });
        load(data?.page || 1, keyword);
      },
    });
  };

  const handleDelete = (id: string) => {
    showDialog({
      title: "Delete course",
      message: "This action cannot be undone. Delete this course?",
      variant: "error",
      confirmLabel: "Delete",
      onConfirm: async () => {
        await api.delete(`/courses/${id}`);
        showDialog({
          title: "Deleted",
          message: "Course deleted.",
          variant: "success",
        });
        load(data?.page || 1, keyword);
      },
    });
  };

  /* ================= GUARD ================= */

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Admin access only.
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading denied courses...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Denied Courses
        </h1>

        {/* SEARCH */}
        <div className="relative">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(1, keyword)}
            placeholder="Search course / teacher..."
            className="px-4 pr-20 py-2 border rounded-full text-sm
                       focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => load(1, keyword)}
            className="absolute right-1 top-1/2 -translate-y-1/2
                       px-4 py-1.5 text-xs font-semibold
                       bg-indigo-600 text-white rounded-full"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Course
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Teacher
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

                <td className="px-4 py-3 text-gray-700">
                  {course.teacher?.name || "—"}
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="px-3 py-1 text-xs border rounded-lg"
                  >
                    View
                  </button>

                  <button
                    onClick={() => handleApprove(course._id)}
                    className="px-3 py-1 text-xs rounded-lg bg-green-600 text-white"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleDelete(course._id)}
                    className="px-3 py-1 text-xs rounded-lg bg-red-500 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {data.items.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No denied courses.
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

        {Array.from(
          { length: data.totalPages },
          (_, i) => i + 1
        ).map((p) => (
          <button
            key={p}
            onClick={() => load(p, keyword)}
            className={`px-3 py-1 border rounded text-sm ${
              p === data.page
                ? "bg-indigo-600 text-white border-indigo-600"
                : ""
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

export default AdminDeniedCourses;
