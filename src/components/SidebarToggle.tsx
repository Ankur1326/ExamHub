"use client";

import { useState } from "react";
import { AiOutlineMenu } from 'react-icons/ai';
import Sidebar from "@/components/admin/Sidebar";

interface SidebarToggleProps {
  userRole: string | null;
}

export default function SidebarToggle({ userRole }: SidebarToggleProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} userRole={userRole} />

      {/* Content Area */}
      <div className="flex-1 ml-0 md:ml-64">
        <header className="flex justify-between h-16 items-center bg-white fixed top-0 left-0 right-0 z-10 shadow-sm rounded-lg border border-gray-200">
          <button
            className="text-2xl md:hidden"
            onClick={toggleSidebar}
          >
            <AiOutlineMenu />
          </button>
        </header>
      </div>

      {/* Overlay for small screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
