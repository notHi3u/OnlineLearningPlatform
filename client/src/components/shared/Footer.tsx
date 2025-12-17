// src/components/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-600">&copy; {new Date().getFullYear()} OLP</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
        </div>
      </div>
    </footer>
  );
};

export default Footer;
