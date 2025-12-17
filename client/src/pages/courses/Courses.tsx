import React, { useEffect, useState } from "react";
import { fetchPaginated } from "../../utils/paginationClient";
import type { PaginatedResponse } from "../../types/pagination";
import { useNavigate } from "react-router-dom";

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  teacher?: { name: string; email: string };
  isPublished: boolean;
}

const Courses: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<PaginatedResponse<Course> | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const load = async (page: number, q = "") => {
    setLoading(true);
    try {
      const result = await fetchPaginated<Course>(
        "/courses",
        page,
        10,
        q ? { q } : undefined
      );

      // ✅ chỉ lấy course đã published
      const publishedItems = result.items.filter(
        (c) => c.isPublished === true
      );

      setData({
        ...result,
        items: publishedItems,
      });
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading courses...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* HEADER + SEARCH */}
      <div className="flex flex-col items-center gap-6 mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>

        <div className="w-full max-w-md relative">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(1, keyword)}
            placeholder="Search courses..."
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

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.items.map((course) => (
          <div
            key={course._id}
            className="bg-white shadow rounded-xl overflow-hidden cursor-pointer
                       hover:shadow-lg transition"
            onClick={() => navigate(`/courses/${course._id}`)}
          >
            {course.thumbnail ? (
              <img
                src={course.thumbnail + "?raw=true"}
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                No Thumbnail
              </div>
            )}

            <div className="p-4 space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">
                {course.title}
              </h2>

              <p className="text-gray-600 text-sm line-clamp-2">
                {course.description}
              </p>

              <div className="pt-2">
                <span className="text-sm text-gray-700">
                  {course.teacher?.name || "Unknown"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {data.items.length === 0 && (
        <p className="text-center text-gray-500 mt-12">
          No published courses found.
        </p>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center space-x-2 mt-10">
        <button
          disabled={data.page === 1}
          onClick={() => load(data.page - 1, keyword)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Prev
        </button>

        {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => load(p, keyword)}
            className={`px-3 py-1 border rounded ${
              p === data.page
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          disabled={data.page === data.totalPages}
          onClick={() => load(data.page + 1, keyword)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Courses;
