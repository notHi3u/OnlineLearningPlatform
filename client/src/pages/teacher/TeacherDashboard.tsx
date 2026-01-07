import { useEffect, useState } from "react";
import { api } from "../../api/http";

interface TeacherStats {
  totalCourses: number;
  published: number;
  pending: number;
  draft: number;
  totalStudents: number;
  recentCourses: {
    id: string;
    title: string;
    status: string;
    students: number;
  }[];
}

const TeacherDashboard = () => {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/teacher");
        setStats(res.data);
      } catch (err: any) {
        console.error("Failed to fetch teacher stats:", err);
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
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back, teacher 👨‍🏫
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="My Courses" value={stats?.totalCourses || 0} />
        <StatCard title="Published" value={stats?.published || 0} />
        <StatCard 
          title="Pending Review" 
          value={stats?.pending || 0} 
          highlight={!!stats?.pending && stats.pending > 0}
        />
        <StatCard title="Total Students" value={stats?.totalStudents || 0} />
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">
            My Courses
          </h2>

          {stats?.recentCourses && stats.recentCourses.length > 0 ? (
            <div className="space-y-3">
              {stats.recentCourses.map((course) => (
                <CourseRow
                  key={course.id}
                  title={course.title}
                  status={course.status as "approved" | "pending" | "draft" | "denied"}
                  students={course.students}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No courses yet. Create your first course!
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <ActionButton label="Create New Course" />
            <ActionButton label="Edit My Courses" />
            <ActionButton label="View Enrollments" />
            <ActionButton label="Check Reviews" />
          </div>
        </div>
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
  value: number;
  highlight?: boolean;
}) => (
  <div
    className={`rounded-xl p-4 shadow bg-white ${
      highlight ? "border-l-4 border-yellow-500" : ""
    }`}
  >
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const CourseRow = ({
  title,
  status,
  students,
}: {
  title: string;
  status: "approved" | "pending" | "draft" | "denied";
  students: number;
}) => {
  const statusStyle =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

  const statusLabel =
    status === "approved"
      ? "Published"
      : status === "pending"
      ? "Pending"
      : status === "denied"
      ? "Denied"
      : "Draft";

  return (
    <div className="flex items-center justify-between border rounded-lg p-3">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-gray-500">
          Students: {students}
        </div>
      </div>

      <span
        className={`px-2 py-1 text-xs font-semibold rounded ${statusStyle}`}
      >
        {statusLabel}
      </span>
    </div>
  );
};

const ActionButton = ({ label }: { label: string }) => (
  <button className="w-full px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 text-left">
    {label}
  </button>
);

export default TeacherDashboard;
