'use client';
import { useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import Sidebar from "../admin/Sidebar";

const ToggleSidebarButton = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            <button className="text-2xl md:hidden" onClick={toggleSidebar}>
                <AiOutlineMenu />
            </button>
            <Sidebar isSidebarOpen={isSidebarOpen} />
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
}

export default ToggleSidebarButton;
