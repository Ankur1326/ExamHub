'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiOutlineUser, AiOutlineSetting, AiOutlineRight, AiOutlineDown } from 'react-icons/ai';
import { BiMoon } from 'react-icons/bi';

interface SidebarProps {
    isSidebarOpen: boolean;
}

export default function Sidebar({ isSidebarOpen }: SidebarProps) {
    const router = useRouter();
    const [currentRoute, setCurrentRoute] = useState('');
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        dashboard: false,
        questionBanks: false,
        // Add more sections here as needed
    });

    useEffect(() => {
        setCurrentRoute(router.pathname);  // Update current route on path change
    }, [router.pathname]);

    const isActive = (route: string) => currentRoute === route ? 'bg-[#00A261] text-white' : 'text-slate-300';

    const navigateTo = (path: string) => {
        router.push(path);
    };

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div
            className={`h-screen w-64 bg-[#0D0E12] shadow p-4 fixed z-50 transform transition-transform duration-300 ease-in-out 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
            <div className="flex flex-col h-full justify-between">
                <div>
                    <a href="/" className="text-xl text-[#00A261] font-bold mb-4">
                        Logo
                    </a>
                    <div className="mt-4">
                        <nav className="space-y-2">
                            {/* Dashboard Section */}
                            <div onClick={() => toggleSection('dashboard')} className="flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer text-slate-300 hover:text-white hover:bg-[#00A261]">
                                <div className="flex items-center space-x-2">
                                    <AiOutlineUser />
                                    <span onClick={() => navigateTo('/dashboard6')}>Dashboard</span>
                                </div>
                                {expandedSections.dashboard ? <AiOutlineDown /> : <AiOutlineRight />}
                            </div>
                            {expandedSections.dashboard && (
                                <div className="pl-8 space-y-2">
                                    <div onClick={() => navigateTo('/dashboard/profile')} className={`flex items-center space-x-2 hover:text-white px-4 py-2 rounded-lg cursor-pointer ${isActive('/dashboard/profile')}`}>
                                        <AiOutlineUser />
                                        <span>My Profile</span>
                                    </div>
                                    <div onClick={() => navigateTo('/dashboard/settings')} className={`flex items-center space-x-2 hover:text-white px-4 py-2 rounded-lg cursor-pointer ${isActive('/dashboard/settings')}`}>
                                        <AiOutlineSetting />
                                        <span>My Account</span>
                                    </div>
                                </div>
                            )}

                            {/* Question Banks Section */}
                            <div onClick={() => toggleSection('questionBanks')} className="flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer text-slate-300 hover:text-white hover:bg-[#00A261]">
                                <div className="flex items-center space-x-2">
                                    <AiOutlineSetting />
                                    <span>Question Banks</span>
                                </div>
                                {expandedSections.questionBanks ? <AiOutlineDown /> : <AiOutlineRight />}
                            </div>
                            {expandedSections.questionBanks && (
                                <div className="pl-8 space-y-2">
                                    <div onClick={() => navigateTo('/question-banks/math')} className={`flex items-center space-x-2 hover:text-white px-4 py-2 rounded-lg cursor-pointer ${isActive('/question-banks/math')}`}>
                                        <AiOutlineUser />
                                        <span>Math</span>
                                    </div>
                                    <div onClick={() => navigateTo('/question-banks/science')} className={`flex items-center space-x-2 hover:text-white px-4 py-2 rounded-lg cursor-pointer ${isActive('/question-banks/science')}`}>
                                        <AiOutlineSetting />
                                        <span>Science</span>
                                    </div>
                                    {/* Add more sub-links here */}
                                </div>
                            )}

                            {/* Other Sections */}
                            {/* Repeat the above structure for additional expandable sections */}
                        </nav>
                    </div>
                </div>
                <div className="mt-8">
                    <div
                        onClick={() => navigateTo('/dark-mode')}
                        className={`flex items-center space-x-2 hover:text-white hover:bg-[#00A261] px-4 py-2 rounded-lg cursor-pointer ${isActive('/dark-mode')}`}
                    >
                        <BiMoon />
                        <span>Dark Mode</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
