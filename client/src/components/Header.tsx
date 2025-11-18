import React from "react";

const Header: React.FC = () => {
  return (
    <header className="w-full bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">MyApp</h1>
        <nav className="space-x-4">
          <a href="/" className="hover:text-gray-300 transition-colors">Home</a>
          <a href="/login" className="hover:text-gray-300 transition-colors">Login</a>
          <a href="/about" className="hover:text-gray-300 transition-colors">About</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
