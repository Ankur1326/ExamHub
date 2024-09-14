'use client';

import { Dot } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiOutlineUser, AiOutlineSetting, AiOutlineRight, AiOutlineDown, AiOutlineHome, AiOutlineDashboard, AiOutlineTags } from 'react-icons/ai';
import { FaQuestionCircle } from 'react-icons/fa';

interface SidebarProps {
    isSidebarOpen: boolean;
}

export default function Sidebar({ isSidebarOpen }: SidebarProps) {
    const router = useRouter();
    const [currentRoute, setCurrentRoute] = useState<string>('');
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        dashboard: false,
        questionBanks: false,
        manageCategories: false,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentRoute(window.location.pathname);
        }
    }, []);

    const isActive = (route: string) => currentRoute === route ? 'bg-[#00A261] text-white' : 'text-slate-300';

    const navigateTo = (path: string) => {
        setCurrentRoute(path);
        router.push(path);
    };

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div
            className={`h-screen w-64 bg-[#0D0E12] shadow-lg p-4 fixed z-50 transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
            <div className="flex flex-col h-full justify-between">
                <div>
                    <a href="/" className="text-xl text-[#00A261] font-bold mb-4 flex items-center space-x-2">
                        {/* <img src="/logo.png" alt="Logo" className="w-8 h-8" /> */}
                        <span>Logo</span>
                    </a>
                    <div className="mt-4">
                        <nav className="space-y-2">
                            {/* Dashboard Section */}
                            <div onClick={() => toggleSection('dashboard')} className={`flex items-center justify-between px-4 py-2 rounded-md cursor-pointer ${isActive('/admin/dashboard')} hover:text-white hover:bg-[#00A261]`}>
                                <div className="flex items-center space-x-2">
                                    <AiOutlineDashboard className="text-lg" />
                                    <span>Dashboard</span>
                                </div>
                                {expandedSections.dashboard ? <AiOutlineDown className="text-lg" /> : <AiOutlineRight className="text-lg" />}
                            </div>
                            {expandedSections.dashboard && (
                                <div className="pl-8 space-y-2">
                                    <div onClick={() => navigateTo('/admin/dashboard')} className={`flex items-center space-x-2 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/dashboard')}`}>
                                        <AiOutlineHome />
                                        <span>Home</span>
                                    </div>
                                    <div onClick={() => navigateTo('/user/profile')} className={`flex items-center space-x-2 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/user/profile')}`}>
                                        <AiOutlineUser />
                                        <span>My Profile</span>
                                    </div>
                                    <div onClick={() => navigateTo('/dashboard/settings')} className={`flex items-center space-x-2 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/dashboard/settings')}`}>
                                        <AiOutlineSetting />
                                        <span>My Account</span>
                                    </div>
                                </div>
                            )}

                            {/* Question Banks Section */}
                            <div onClick={() => toggleSection('questionBanks')} className={`flex items-center justify-between px-4 py-2 rounded-md cursor-pointer ${isActive('/admin/question-banks')} hover:text-white hover:bg-[#00A261]`}>
                                <div className="flex items-center space-x-2">
                                    <FaQuestionCircle className="text-lg" />
                                    <span>Question Banks</span>
                                </div>
                                {expandedSections.questionBanks ? <AiOutlineDown className="text-lg" /> : <AiOutlineRight className="text-lg" />}
                            </div>
                            {expandedSections.questionBanks && (
                                <div className="pl-8 space-y-2">
                                    <div onClick={() => navigateTo('/admin/question-types')} className={`flex items-center space-x-1 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/question-types')}`}>
                                        {/* <AiOutlineFileText className="text-lg" /> */}
                                        <Dot />
                                        <span>Question Types</span>
                                    </div>
                                    {/* Add more sub-links here */}
                                </div>
                            )}

                            {/* Manage Categories Section */}
                            <div onClick={() => toggleSection('manageCategories')} className={`flex items-center justify-between px-4 py-2 rounded-md cursor-pointer ${isActive('/admin/manage-categories')} hover:text-white hover:bg-[#00A261]`}>
                                <div className="flex items-center space-x-2">
                                    <AiOutlineTags className="text-lg" />
                                    <span>Manage Categories</span>
                                </div>
                                {expandedSections.manageCategories ? <AiOutlineDown className="text-lg" /> : <AiOutlineRight className="text-lg" />}
                            </div>
                            {expandedSections.manageCategories && (
                                <div className="pl-8 space-y-2">
                                    <div onClick={() => navigateTo('/admin/tags')} className={`flex items-center space-x-1 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/tags')}`}>
                                        {/* <AiOutlineTags className="text-lg" /> */}
                                        <Dot />
                                        <span>Tags</span>
                                    </div>
                                </div>
                            )}

                            {/* Dark Mode Toggle */}
                            {/* <div
                                onClick={() => navigateTo('/dark-mode')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer ${isActive('/dark-mode')} hover:text-white hover:bg-[#00A261] mt-8`}
                            >
                                <BiMoon className="text-lg" />
                                <span>Dark Mode</span>
                            </div> */}
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
