"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Public() {
  return (
    <div>
      <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <a href="#" className="text-xl font-bold mb-4 md:mb-0">
            Logo
          </a>
          <Link href="/sign-in">
            <button
              className="w-full md:w-auto bg-slate-100 text-black px-3 py-1 rounded-sm"
            >
              Login
            </button>
          </Link>
        </div>
      </nav>
      <div className="w-full h-screen flex items-center justify-center ">
        <p className="text-3xl opacity-35">
          Public Page
        </p>
      </div>
    </div>
  );
}
