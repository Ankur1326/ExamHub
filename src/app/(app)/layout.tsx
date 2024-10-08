"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/admin/Sidebar";
import { store } from "@/redux/store";
import { useState } from "react";
import { AiOutlineMenu } from 'react-icons/ai';
import { Provider } from "react-redux";
import 'react-loading-skeleton/dist/skeleton.css'
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function RootLayout({ children }: any) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Content Area */}
      <NextThemesProvider attribute="class">
        <Provider store={store}>
          <div className="flex-1 ml-0 md:ml-64">
            <header className="flex justify-between h-16 bg-[#181920] dark:border-b dark:border-border_secondary items-center fixed top-0 left-0 right-0 z-10 shadow-sm">
              <button
                className="text-2xl md:hidden"
                onClick={toggleSidebar}
              >
                <AiOutlineMenu />
              </button>
              <div className="absolute right-5">
                <Navbar />
              </div>
            </header>
            <main className="mt-16 px-2 py-3 bg-[#f6f5f6] dark:bg-bg_primary h-full">
              {children}
            </main>
          </div>
        </Provider>
      </NextThemesProvider>
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
