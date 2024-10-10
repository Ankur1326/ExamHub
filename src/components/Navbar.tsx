"use client";
import React from "react";
import ProfileMenu from "./ProfileMenu";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ClipLoader, ScaleLoader } from "react-spinners";
import ThemeSelector from "@/components/admin/ThemeSelector";
import { Audio, FidgetSpinner, RotatingLines, TailSpin, ThreeCircles } from 'react-loader-spinner'

function Navbar() {
    const isLoading = useSelector((state: RootState) => state.loading.isLoading);

    return (
        <nav className="text-black flex gap-6 items-center">
            <div className="relative flex items-center">
                <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-800 animate-pulse"></div>
                {isLoading && (
                    <div className="flex items-center space-x-2">
                        <ClipLoader color="#4F46E5" size={20} />
                        <span className='text-xs dark:text-gray-300 text-gray-600 animate-pulse'>
                            Loading...
                        </span>
                    </div>
                )}
            </div>
            <ThemeSelector />
            <ProfileMenu />
        </nav>
    )
}

export default Navbar
