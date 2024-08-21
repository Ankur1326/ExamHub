"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AiOutlineMenu } from 'react-icons/ai';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      // router.replace("/sign-in");
    }
  }, [status, router]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1">
          {/* Main Content Area */}
          <header className="w-full flex justify-between p-4 bg-white shadow fixed top-0 left-0 right-0 z-10">
            <a href="#" className="text-xl font-bold mb-4 md:mb-0">
              Logo
            </a>
            <Link href="/sign-in">
              <button
                className=""
              >
                Login
              </button>
            </Link>
          </header>
          <main className="mt-16">{children}</main> {/* Add margin-top to prevent content from hiding under header */}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for large screens */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Menu bar icon for small screens */}
      <div className="flex-1 ml-0 md:ml-64">
        <header className="flex justify-between p-4 h-16 bg-white shadow fixed top-0 left-0 right-0 z-10">
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
        <main className="mt-16 px-2 py-3">{children}</main>
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
