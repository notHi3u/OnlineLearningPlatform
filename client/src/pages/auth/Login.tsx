import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useDialog } from "../../components/shared/DialogProvider";
import { api } from "../../api/http";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { showDialog } = useDialog();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
        role,
      });

      const { accessToken, refreshToken, user } = res.data;

      auth.setAuth(user, accessToken, refreshToken);

      if (user.role === "teacher") navigate("/teacher/dashboard");
      else navigate("/student/dashboard");
    } catch (err: any) {
      console.error(err);

      const msg =
        err?.response?.data?.message ||
        "Invalid credentials. Please check your email, password and role.";

      showDialog({
        title: "Login failed",
        message: msg,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Login to Your Account
        </h1>

        {/* Role Selection */}
        <div className="mb-4 flex items-center justify-center space-x-6">
          <label className="flex items-center space-x-2 text-gray-700 cursor-pointer">
            <input
              type="radio"
              value="student"
              checked={role === "student"}
              onChange={() => setRole("student")}
              className="h-4 w-4 text-indigo-600"
            />
            <span>Student</span>
          </label>

          <label className="flex items-center space-x-2 text-gray-700 cursor-pointer">
            <input
              type="radio"
              value="teacher"
              checked={role === "teacher"}
              onChange={() => setRole("teacher")}
              className="h-4 w-4 text-indigo-600"
            />
            <span>Teacher</span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password with Icon */}
          <div className="relative">
            <label className="block text-gray-700 mb-1">Password</label>

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="********"
              required
            />

            {/* Toggle Icon Button */}
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

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="text-sm text-indigo-600 hover:underline"
              onClick={() =>
                showDialog({
                  title: "Forgot password",
                  message: "Forgot password flow is not implemented yet.",
                  variant: "info",
                })
              }
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-indigo-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-indigo-600 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
