import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import { useAuth } from "../../store/auth";

interface EnrolledCourse {
  enrollmentId: string;
  progress: number;
  role: string;
  enrolledAt: string;
  course: {
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    teacher?: {
      name: string;
      email: string;
    };
  };
}

export default function StudentCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "progress">("all");

  const filteredItems = items.filter(item => {
    const title = item.course?.title?.toLowerCase() || "";

    const matchSearch = title.includes(search.toLowerCase());

    let matchFilter = true;
    if (filter === "completed") matchFilter = item.progress === 100;
    else if (filter === "progress") matchFilter = item.progress >= 0 && item.progress < 100;

    return matchSearch && matchFilter;
  });


  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/student/courses");

      const filtered = (res.data.items || []).filter(
        (item: any) =>
          item.course &&
          item.course.isPublished === true
      );

      setItems(filtered);
    } catch (err) {
      console.error("Failed to load enrolled courses", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, []);

  /* ================= GUARD ================= */
  if (user?.role == "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Forbidden
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading your courses...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* HEADER */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Enrolled Courses
        </h1>
        <p className="mt-2 text-gray-500">
          Courses you have enrolled in
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full sm:w-1/2 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />

        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-sm border 
            ${filter === "all" ? "bg-indigo-600 text-white" : "bg-white hover:bg-gray-100"}`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("progress")}
            className={`px-3 py-1 rounded-lg text-sm border 
            ${filter === "progress" ? "bg-indigo-600 text-white" : "bg-white hover:bg-gray-100"}`}
          >
            In Progress
          </button>

          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1 rounded-lg text-sm border 
            ${filter === "completed" ? "bg-green-600 text-white" : "bg-white hover:bg-gray-100"}`}
          >
            Completed
          </button>
        </div>
      </div>


      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map(item => {
          const course = item.course;

          return (
            <div
              key={item.enrollmentId}
              onClick={() => navigate(`/courses/${course._id}`)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
            >
              {/* THUMBNAIL */}
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                  No Thumbnail
                </div>
              )}

              {/* CONTENT */}
              <div className="p-4 space-y-3">
                <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {course.title}
                </h2>

                {course.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* TEACHER */}
                <div className="text-sm text-gray-500">
                  {course.teacher?.name || "Unknown teacher"}
                </div>

                {/* PROGRESS */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY */}
      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 mt-16">
          No courses found.
        </div>
      )}
    </div>
  );
}
