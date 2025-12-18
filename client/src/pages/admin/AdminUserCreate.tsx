import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import { useAuth } from "../../store/auth";
import { useDialog } from "../../components/shared/DialogProvider";

export default function AdminUserCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showDialog } = useDialog();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Forbidden
      </div>
    );
  }

  const handleCreate = async () => {
    if (!name || !email || !password) {
      return showDialog({
        title: "Missing fields",
        message: "Please fill all required fields",
        variant: "warning",
      });
    }

    setSaving(true);
    try {
      await api.post("/admin/users", {
        name,
        email,
        role,
        password,
      });

      showDialog({
        title: "Created",
        message: "User created successfully",
        variant: "success",
      });

      navigate("/admin/users");
    } catch (err: any) {
      showDialog({
        title: "Error",
        message:
          err?.response?.data?.message || "Failed to create user",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate("/admin/users")}
        className="mb-6 text-indigo-600 hover:underline"
      >
        ← Back to users
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Create User</h1>

        {/* 🔒 disable browser autofill */}
        <form autoComplete="off" className="space-y-4 text-sm">
          <div>
            <label className="text-gray-500">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-gray-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-gray-500">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-gray-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </form>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg
                       disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create user"}
          </button>
        </div>
      </div>
    </div>
  );
}
