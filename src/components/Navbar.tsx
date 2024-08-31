"use client";
import React from "react";
import ProfileMenu from "./ProfileMenu";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Blocks, Loader2 } from "lucide-react";

function Navbar() {
    const isLoading = useSelector((state: RootState) => state.loading.isLoading);

    return (
        <nav className="text-black flex gap-2 items-center">
            {
                isLoading && <Loader2 className="animate-spin" width={20} />
            }
            <ProfileMenu />
        </nav>
    )
}

export default Navbar
