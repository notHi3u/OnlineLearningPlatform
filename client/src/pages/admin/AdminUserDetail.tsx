import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import { useAuth } from "../../store/auth";
import { useDialog } from "../../components/shared/DialogProvider";

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
  };
  role: string;
  progress: number;
}

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  createdAt: string;
  enrollments: Enrollment[];
}

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showDialog } = useDialog();

  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setData(res.data);
      setName(res.data.name);
      setRole(res.data.role);
    } catch {
      showDialog({
        title: "Error",
        message: "Failed to load user",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!data) return;

    setSaving(true);
    try {
      await api.put(`/admin/users/${data._id}`, { name, role });

      showDialog({
        title: "Saved",
        message: "User updated successfully",
        variant: "success",
      });

      load();
    } catch {
      showDialog({
        title: "Error",
        message: "Failed to update user",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ================= CHANGE PASSWORD ================= */
  const handleChangePassword = () => {
    if (!data) return;
  
    showDialog({
      title: "Change password",
      message: "Enter new password for this user",
      variant: "warning",
      inputs: [
        {
          name: "password",
          type: "password",
          placeholder: "New password",
          required: true,
          autoComplete: "new-password",
        },
        {
          name: "confirm",
          type: "password",
          placeholder: "Confirm password",
          required: true,
          autoComplete: "new-password",
        },
      ],
      confirmLabel: "Update",
      cancelLabel: "Cancel",
      onConfirm: async (values) => {
        if (!values) return;
  
        if (values.password !== values.confirm) {
          showDialog({
            title: "Error",
            message: "Passwords do not match",
            variant: "error",
          });
          return;
        }
  
        try {
          await api.put(`/admin/users/${data._id}`, {
            password: values.password,
          });
  
          showDialog({
            title: "Updated",
            message: "Password changed successfully",
            variant: "success",
          });
        } catch {
          showDialog({
            title: "Error",
            message: "Failed to change password",
            variant: "error",
          });
        }
      },
    });
  };
  

  /* ================= DELETE ================= */
  const handleDeleteUser = () => {
    if (!data) return;

    showDialog({
      title: "Delete user",
      message: "This action cannot be undone.",
      variant: "warning",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${data._id}`);

          showDialog({
            title: "Deleted",
            message: "User has been deleted.",
            variant: "success",
          });

          navigate("/admin/users");
        } catch {
          showDialog({
            title: "Error",
            message: "Failed to delete user",
            variant: "error",
          });
        }
      },
    });
  };

  /* ================= GUARDS ================= */
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
        Loading user...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate("/admin/users")}
        className="mb-6 text-indigo-600 hover:underline"
      >
        ← Back to users
      </button>

      {/* USER INFO */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">User Detail</h1>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <label className="text-gray-500">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-gray-500">Email</label>
            <div className="mt-1 font-medium">{data.email}</div>
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
            <label className="text-gray-500">Joined</label>
            <div className="mt-1 font-medium">
              {new Date(data.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
            <button
            onClick={handleChangePassword}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
            Change password
            </button>

        {data.role !== "admin" && (
            <button
                onClick={handleDeleteUser}
                disabled={saving}
                className="px-4 py-2 border border-red-500 text-red-600 rounded-lg
                        hover:bg-red-50 disabled:opacity-50"
            >
                Delete user
            </button>
            )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {/* ENROLLMENTS */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Enrolled Courses ({data.enrollments.length})
        </h2>

        {data.enrollments.length === 0 ? (
          <div className="text-gray-500 text-sm">No enrollments</div>
        ) : (
          <div className="space-y-3">
            {data.enrollments.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <div className="font-medium">{e.course.title}</div>
                  <div className="text-xs text-gray-500">
                    Progress: {e.progress}%
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/courses/${e.course._id}`)}
                  className="px-3 py-1 text-xs border rounded hover:bg-gray-50"
                >
                  View course
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
