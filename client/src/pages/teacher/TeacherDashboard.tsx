const TeacherDashboard = () => {
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
        <StatCard title="My Courses" value="8" />
        <StatCard title="Published" value="5" />
        <StatCard title="Pending Review" value="2" highlight />
        <StatCard title="Total Students" value="1,342" />
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">
            My Courses
          </h2>

          <div className="space-y-3">
            <CourseRow
              title="React for Beginners"
              status="published"
              students={420}
            />
            <CourseRow
              title="Advanced NodeJS"
              status="pending"
              students={0}
            />
            <CourseRow
              title="TypeScript Mastery"
              status="draft"
              students={0}
            />
          </div>
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

const CourseRow = ({
  title,
  status,
  students,
}: {
  title: string;
  status: "published" | "pending" | "draft";
  students: number;
}) => {
  const statusStyle =
    status === "published"
      ? "bg-green-100 text-green-700"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

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
        {status}
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
