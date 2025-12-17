import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../store/auth";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Role = "student" | "teacher" | "admin";

interface MenuItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: Role[];
}

const MENU: MenuItem[] = [
    // DASHBOARD
    {
      label: "Dashboard",
      to: "/student/dashboard",
      icon: <LayoutDashboard size={18} />,
      roles: ["student"],
    },
    {
      label: "Dashboard",
      to: "/teacher/dashboard",
      icon: <LayoutDashboard size={18} />,
      roles: ["teacher"],
    },
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: <LayoutDashboard size={18} />,
      roles: ["admin"],
    },
  
    // COURSES (public)
    {
      label: "Courses",
      to: "/courses",
      icon: <BookOpen size={18} />,
      roles: ["student", "teacher", "admin"],
    },
  
    // STUDENT
    {
      label: "My Courses",
      to: "/student/courses",
      icon: <GraduationCap size={18} />,
      roles: ["student"],
    },
  
    // TEACHER
    {
      label: "Manage Courses",
      to: "/teacher/courses",
      icon: <GraduationCap size={18} />,
      roles: ["teacher"],
    },
  
    // ADMIN
    {
      label: "Users",
      to: "/admin/users",
      icon: <Users size={18} />,
      roles: ["admin"],
    },
    {
      label: "Settings",
      to: "/admin/settings",
      icon: <Settings size={18} />,
      roles: ["admin"],
    },
  ];  

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  return (
    <aside
      className={`
        ${collapsed ? "w-16" : "w-64"}
        h-screen bg-white border-r border-gray-200
        flex flex-col transition-all duration-300
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              O
            </div>
            <span className="text-sm font-semibold text-gray-800">
              OLP
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* ROLE */}
      {!collapsed && (
        <p className="px-4 mb-3 text-xs text-gray-400 uppercase tracking-wide">
          {user.role}
        </p>
      )}

      {/* MENU (scrollable) */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 pb-6">
        {MENU.filter((m) => m.roles.includes(user.role)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
              ${
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }
              ${collapsed ? "justify-center" : ""}
            `
            }
          >
            {item.icon}
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
