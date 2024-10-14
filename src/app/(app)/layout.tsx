"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/admin/Sidebar";
import { store } from "@/redux/store";
import { useEffect, useState } from "react";
import { AiOutlineMenu } from 'react-icons/ai';
import { Provider } from "react-redux";
import 'react-loading-skeleton/dist/skeleton.css'
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Import the CSS file
import '../globals.css';

// Configure NProgress (optional)
NProgress.configure({ showSpinner: false, speed: 500, minimum: 0.3  });

export default function RootLayout({ children }: any) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleStop);
    Router.events.on('routeChangeError', handleStop);

    return () => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleStop);
      Router.events.off('routeChangeError', handleStop);
    };
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Content Area */}
      <NextThemesProvider attribute="class">
        <Provider store={store}>
          <div className="flex-1 ml-0 md:ml-64">
            <header className="flex justify-between h-16 bg-white dark:bg-[#181920] dark:border-b dark:border-border_secondary items-center fixed top-0 left-0 right-0 z-10 shadow-sm">
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
