const AdminDashboard = () => {
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
        <StatCard title="Total Users" value="1,248" />
        <StatCard title="Total Courses" value="86" />
        <StatCard title="Pending Courses" value="12" highlight />
        <StatCard title="Enrollments" value="5,421" />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">
            Recent Activities
          </h2>

          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span>User <b>john@email.com</b> created</span>
              <span className="text-gray-400">2 min ago</span>
            </li>
            <li className="flex justify-between">
              <span>Course <b>React Basics</b> approved</span>
              <span className="text-gray-400">10 min ago</span>
            </li>
            <li className="flex justify-between">
              <span>User <b>teacher01</b> role updated</span>
              <span className="text-gray-400">1 hour ago</span>
            </li>
            <li className="flex justify-between">
              <span>Course <b>NodeJS API</b> denied</span>
              <span className="text-gray-400">Yesterday</span>
            </li>
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
  value: string;
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

const ActionButton = ({ label }: { label: string }) => (
  <button className="w-full px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 text-left">
    {label}
  </button>
);

export default AdminDashboard;
