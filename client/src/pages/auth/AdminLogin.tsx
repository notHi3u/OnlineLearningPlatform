import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useDialog } from "../../components/shared/DialogProvider";
import { api } from "../../api/http";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { showDialog } = useDialog();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ toggle
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
        role: "admin",
      });

      const { accessToken, refreshToken, user } = res.data;

      setAuth(user, accessToken, refreshToken);
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error(err);

      const msg =
        err?.response?.data?.message ||
        "Invalid credentials or you are not an admin.";

      showDialog({
        title: "Admin login failed",
        message: msg,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Email"
              required
            />
          </div>

          {/* Password with icon */}
          <div className="relative">
            <label className="block text-gray-700 mb-1">Password</label>

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="********"
              required
            />

            {/* Toggle password button */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
