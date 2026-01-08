// client/src/components/shared/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { api } from "../../api/http";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Role = "student" | "teacher" | "admin";

interface MenuItem {
  label: string;
  to?: string;
  icon: React.ReactNode;
  roles: Role[];
  children?: MenuItem[];
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

  // PUBLIC COURSES
  {
    label: "Courses",
    to: "/courses",
    icon: <BookOpen size={18} />,
    roles: ["student", "teacher"],
  },

  // STUDENT
  {
    label: "Enrolled Courses",
    to: "/student/courses",
    icon: <GraduationCap size={18} />,
    roles: ["student",],
  },

  {
    label: "Exam history",
    to: "/exam/history",
    icon: <GraduationCap size={18} />,
    roles: ["student",],
  },

  // TEACHER
  {
    label: "Manage Courses",
    to: "/teacher/courses",
    icon: <GraduationCap size={18} />,
    roles: ["teacher"],
  },

  {
    label: "Enrolled Courses",
    to: "/student/courses",
    icon: <GraduationCap size={18} />,
    roles: ["teacher"],
  },

  {
    label: "Exam history",
    to: "/exam/history",
    icon: <GraduationCap size={18} />,
    roles: ["teacher",],
  },

  // ADMIN COURSES (SUB MENU)
  {
    label: "Courses",
    icon: <BookOpen size={18} />,
    roles: ["admin"],
    children: [
      {
        label: "Public Courses",
        to: "/courses",
        icon: <BookOpen size={16} />,
        roles: ["admin"],
      },
      {
        label: "Pending Approval",
        to: "/admin/courses/pending",
        icon: <GraduationCap size={16} />,
        roles: ["admin"],
      },
      {
        label: "Denied Courses",
        to: "/admin/courses/denied",
        icon: <GraduationCap size={16} />,
        roles: ["admin"],
      },
    ],
  },

  // ADMIN
  {
    label: "Users",
    to: "/admin/users",
    icon: <Users size={18} />,
    roles: ["admin"],
  },

  // ADMIN
  {
    label: "Exam History",
    to: "/admin/exam/history",
    icon: <Users size={18} />,
    roles: ["admin"],
  }
];

// Badge component for notifications
const Badge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;
  return (
    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [pendingCourses, setPendingCourses] = useState<number>(0);

  // Fetch pending courses count for admin
  useEffect(() => {
    if (user?.role === "admin") {
      const fetchPendingCount = async () => {
        try {
          const res = await api.get("/dashboard/admin");
          setPendingCourses(res.data.stats.pendingCourses || 0);
        } catch (err) {
          console.error("Failed to fetch pending courses count:", err);
        }
      };
      fetchPendingCount();
    }
  }, [user?.role]);

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
          onClick={() => setCollapsed(v => !v)}
          className="p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ROLE */}
      {!collapsed && (
        <p className="px-4 mb-3 text-xs text-gray-400 uppercase tracking-wide">
          {user.role}
        </p>
      )}

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 pb-6">
        {MENU.filter(m => m.roles.includes(user.role)).map(item => {
          // ===== SUB MENU =====
          if (item.children) {
            const opened = openMenu === item.label;

            return (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setOpenMenu(opened ? null : item.label)
                  }
                  className={`
                    flex items-center gap-3 px-3 py-2 w-full rounded-lg
                    text-sm font-medium text-gray-700 hover:bg-gray-100
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  {item.icon}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">
                        {item.label}
                      </span>
                      {item.label === "Courses" && user?.role === "admin" && (
                        <Badge count={pendingCourses} />
                      )}
                      <ChevronRight
                        size={14}
                        className={`transition ${opened ? "rotate-90" : ""}`}
                      />
                    </>
                  )}
                </button>

                {!collapsed && opened && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map(child => (
                      <NavLink
                        key={child.to}
                        to={child.to!}
                        className={({ isActive }) =>
                          `
                          flex items-center px-3 py-2 rounded-lg text-sm
                          ${
                            isActive
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-600 hover:bg-gray-100"
                          }
                        `
                        }
                      >
                        <span className="flex-1">{child.label}</span>
                        {child.label === "Pending Approval" && user?.role === "admin" && (
                          <Badge count={pendingCourses} />
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // ===== NORMAL ITEM =====
          return (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-sm font-medium transition
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
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
