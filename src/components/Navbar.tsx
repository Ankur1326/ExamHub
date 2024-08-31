"use client";
import React from "react";
import ProfileMenu from "./ProfileMenu";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ClipLoader } from "react-spinners";

function Navbar() {
    const isLoading = useSelector((state: RootState) => state.loading.isLoading);

    return (
        <nav className="text-black flex gap-3 items-center">
            <div className="relative flex items-center">
                {/* Other Navbar items can go here */}
                {isLoading && (
                    <div className="flex items-center space-x-2">
                        <ClipLoader color="#3699FF" size={30} />
                        <span className="text-sm text-blue-500 animate-pulse">Loading...</span>
                    </div>
                )}
            </div>
            <ProfileMenu />
        </nav>
    )
}

export default Navbar
