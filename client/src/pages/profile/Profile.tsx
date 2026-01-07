import { useEffect, useState } from "react";
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

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  createdAt: string;
  enrollments: Enrollment[];
}

export default function Profile() {
  const { user, setName } = useAuth();
  const { showDialog } = useDialog();

  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setNameInput] = useState("");

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const res = await api.get("/users/me");
      setData(res.data);
      setNameInput(res.data.name);
    } catch {
      showDialog({
        title: "Error",
        message: "Failed to load profile",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!data) return;

    setSaving(true);
    try {
      await api.put("/users/me", { name });

      // Update auth store
      setName(name);

      showDialog({
        title: "Saved",
        message: "Profile updated successfully",
        variant: "success",
      });

      load();
    } catch {
      showDialog({
        title: "Error",
        message: "Failed to update profile",
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
      message: "Enter new password",
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
          await api.put("/users/me", {
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

  /* ================= GUARDS ================= */
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Please login to view this page
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>

      {/* USER INFO */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <label className="text-gray-500">Name</label>
            <input
              value={name}
              onChange={(e) => setNameInput(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-gray-500">Email</label>
            <div className="mt-1 font-medium">{data.email}</div>
          </div>

          <div>
            <label className="text-gray-500">Role</label>
            <div className="mt-1 font-medium capitalize">{data.role}</div>
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
          My Courses ({data.enrollments.length})
        </h2>

        {data.enrollments.length === 0 ? (
          <div className="text-gray-500 text-sm">No courses yet</div>
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
                  onClick={() => window.location.href = `/courses/${e.course._id}`}
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
