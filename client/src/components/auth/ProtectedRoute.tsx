import { Navigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
  role?: string; // "student" | "teacher" | "admin" (optional)
}

const ProtectedRoute = ({ children, role }: Props) => {
  const { user } = useAuth();

  // Chưa login
  if (!user) return <Navigate to="/login" replace />;

  // Không yêu cầu role cụ thể -> chỉ cần login là cho qua
  if (!role) return children;

  const userRole = user.role;

  // Permission theo level:
  // - "student": mọi role login (student / teacher / admin) đều access
  // - "teacher": teacher + admin
  // - "admin": chỉ admin
  const canAccess = () => {
    if (role === "student") {
      return ["student", "teacher", "admin"].includes(userRole);
    }

    if (role === "teacher") {
      return ["teacher", "admin"].includes(userRole);
    }

    if (role === "admin") {
      return userRole === "admin";
    }

    // fallback (nếu role lạ)
    return userRole === role;
  };

  if (!canAccess()) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;
