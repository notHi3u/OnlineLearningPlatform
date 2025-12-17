import { useEffect, useState } from "react";
import { fetchPaginated } from "../../utils/paginationClient";
import { api } from "../../api/http";
import { useDialog } from "../../components/shared/DialogProvider";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showDialog } = useDialog();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");

  /* ================= LOAD ================= */
  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchPaginated<User>(
        "/admin/users",
        page,
        10,
        {
          ...(keyword ? { q: keyword } : {}),
          ...(role ? { role } : {}),
        }
      );
      setData(res);
    } catch {
      showDialog({
        title: "Error",
        message: "Failed to load users",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  /* ================= ACTIONS ================= */
  const handleDelete = (id: string) => {
    showDialog({
      title: "Delete user",
      message: "This action cannot be undone.",
      variant: "warning",
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await api.delete(`/users/${id}`);
          load(data.page);
        } catch {
          showDialog({
            title: "Error",
            message: "Delete failed",
            variant: "error",
          });
        }
      },
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Forbidden
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading users...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* FILTER */}
      <div className="flex gap-3 mb-6">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search name or email"
          className="px-4 py-2 border rounded-lg text-sm"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <button
          onClick={() => load(1)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
        >
          Filter
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.items.map((u: User) => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                    <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                        u.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : u.role === "teacher"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {u.role}
                    </span>
                    </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/admin/users/${u._id}`)}
                    className="px-3 py-1 border rounded text-xs"
                  >
                    View
                  </button>

                  {u._id !== user.id && (
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {data.items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No users found
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
                onClick={() => load(data.page - 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40"
            >
                Prev
            </button>

            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                key={p}
                onClick={() => load(p)}
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
                onClick={() => load(data.page + 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40"
            >
                Next
            </button>
        </div>
    </div>
  );
}
