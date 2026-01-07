import { useEffect, useState } from "react";
import { api } from "../../api/http";

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  pendingCourses: number;
  enrollments: number;
  usersByRole: { _id: string; count: number }[];
  coursesByStatus: { _id: string; count: number }[];
}

interface RecentActivity {
  users: { email: string; createdAt: string }[];
  courses: { title: string; status: string; updatedAt: string; teacher: string }[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/admin");
        setStats(res.data.stats);
        setActivities(res.data.recentActivities);
      } catch (err: any) {
        console.error("Failed to fetch admin stats:", err);
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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back, admin 🛠️
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} />
        <StatCard title="Total Courses" value={stats?.totalCourses || 0} />
        <StatCard 
          title="Pending Courses" 
          value={stats?.pendingCourses || 0} 
          highlight={!!stats?.pendingCourses && stats.pendingCourses > 0}
        />
        <StatCard title="Enrollments" value={stats?.enrollments || 0} />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">
            Recent Activities
          </h2>

          <ul className="space-y-3 text-sm">
            {activities?.users.slice(0, 3).map((user, idx) => (
              <li key={`user-${idx}`} className="flex justify-between">
                <span>User <b>{user.email}</b> created</span>
                <span className="text-gray-400">{formatTime(user.createdAt)}</span>
              </li>
            ))}
            {activities?.courses.slice(0, 2).map((course, idx) => (
              <li key={`course-${idx}`} className="flex justify-between">
                <span>Course <b>{course.title}</b> {course.status}</span>
                <span className="text-gray-400">{formatTime(course.updatedAt)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <ActionButton label="Create User" />
            <ActionButton label="Approve Courses" />
            <ActionButton label="Manage Users" />
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
    <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
  </div>
);

const ActionButton = ({ label }: { label: string }) => (
  <button className="w-full px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 text-left">
    {label}
  </button>
);

export default AdminDashboard;
