import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-lg mb-6">Page not found</p>
      <button
        onClick={() => navigate("/")}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
