// src/components/Header.tsx
import React from "react";
import { useAuth } from "../../store/auth";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout } = useAuth();

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
            <div className="flex items-center space-x-4">

              {/* NAME */}
              <span className="text-gray-800 font-medium">
                {user.name}
              </span>

              {/* LOGOUT */}
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Logout
              </button>
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
