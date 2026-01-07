import { useEffect, useState } from "react";
import { api } from "../../api/http";
import { useNavigate } from "react-router-dom";

interface StudentStats {
  totalEnrolled: number;
  averageProgress: number;
  completedCourses: number;
  inProgressCourses: number;
}

interface RecentCourse {
  id: string;
  title: string;
  progress: number;
  enrolledAt: string;
}

const StudentDashboard = () => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/student");
        setStats(res.data.stats);
        setRecentCourses(res.data.recentCourses);
      } catch (err: any) {
        console.error("Failed to fetch student stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome, student! 🎓</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Enrolled Courses" value={stats?.totalEnrolled || 0} />
        <StatCard title="Average Progress" value={`${stats?.averageProgress || 0}%`} />
        <StatCard title="Completed" value={stats?.completedCourses || 0} highlight />
        <StatCard title="In Progress" value={stats?.inProgressCourses || 0} />
      </div>

      {/* RECENT COURSES */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4">Recent Courses</h2>
        
        {recentCourses.length > 0 ? (
          <div className="space-y-3">
            {recentCourses.map((course) => (
              <div
                key={course.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{course.title}</div>
                    <div className="text-sm text-gray-500">
                      Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {course.progress}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No courses enrolled yet. Browse available courses!
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/courses")}
          className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Browse Courses
        </button>
        <button
          onClick={() => navigate("/student/courses")}
          className="px-4 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
        >
          My Courses
        </button>
        <button
          onClick={() => navigate("/exam/history")}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Exam History
        </button>
      </div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const StatCard = ({
  title,
  value,
  highlight,
}: {
  title: string;
  value: number | string;
  highlight?: boolean;
}) => (
  <div
    className={`rounded-xl p-4 shadow bg-white ${
      highlight ? "border-l-4 border-green-500" : ""
    }`}
  >
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

export default StudentDashboard;
