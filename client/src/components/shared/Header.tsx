import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";
import { logout } from "../../api/http";

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <h1 className="text-2xl font-bold text-gray-800">
          <Link to="/">OLP</Link>
        </h1>

        {/* CENTER NAV */}
        <nav className="flex space-x-4"></nav>

        {/* RIGHT SECTION */}
        <div className="flex items-center space-x-6">

          {/* 🔵 If Logged In */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-gray-800 hover:text-gray-600 transition"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User size={18} className="text-indigo-600" />
                </div>
                <span className="font-medium">{user.name}</span>
                <ChevronDown size={16} className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* DROPDOWN MENU */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 🔴 Not Logged In → Login / Signup
            <div className="flex items-center space-x-2 text-gray-800 font-medium">
              <Link to="/login" className="hover:text-gray-900">
                Login
              </Link>

              <span className="text-gray-500">/</span>

              <Link to="/signup" className="hover:text-gray-900">
                Signup
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

export default Header;
