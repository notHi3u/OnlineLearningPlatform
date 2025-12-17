import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDialog } from "../../components/shared/DialogProvider";
import { api } from "../../api/http";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/;

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { showDialog } = useDialog();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showDialog({
        title: "Password mismatch",
        message: "Passwords do not match!",
        variant: "error",
      });
      return;
    }

    if (!agree) {
      showDialog({
        title: "Terms required",
        message: "You must agree to the terms!",
        variant: "info",
      });
      return;
    }

    if (!strongPasswordRegex.test(password)) {
      showDialog({
        title: "Weak password",
        message:
          "Password must be at least 8 characters and include lowercase, UPPERCASE, number and special character.",
        variant: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      showDialog({
        title: "Success",
        message: res.data.message || "Account created successfully!",
        variant: "success",
      });

      navigate("/login");
    } catch (err: any) {
      console.error(err);

      const msg =
        err?.response?.data?.message ||
        "Sign up failed. Please try again.";

      showDialog({
        title: "Sign up failed",
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
          Create an Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
              required
            />
          </div>

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

          {/* Password */}
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

            <p className="mt-1 text-xs text-gray-500">
            At least 8 characters and include lowercase, UPPERCASE, number and special character.
            </p>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-gray-700 mb-1">Confirm Password</label>

            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="********"
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Terms */}
          <div className="flex items-center space-x-2 text-gray-700">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 focus:ring-indigo-500"
              required
            />
            <span>I agree to the terms and conditions</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-indigo-300"
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
