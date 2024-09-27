'use client';

import { Dot } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiOutlineUser, AiOutlineSetting, AiOutlineHome, AiOutlineDashboard, AiOutlineTags } from 'react-icons/ai';
import { FaAngleDown, FaQuestionCircle } from 'react-icons/fa';

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
        manageSubject: false
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
        <div className={`h-screen w-64 bg-[#0D0E12] shadow-lg p-4 fixed z-50 transform transition-transform duration-500 ease-out overflow-y-auto scrollbar-custom ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <a href="/" className="text-2xl text-[#00A261] font-bold flex items-center space-x-2">
                        <span>Logo</span>
                    </a>
                </div>

                <nav className="space-y-2 mb-4">
                    {/* Dashboard Section */}
                    <div onClick={() => toggleSection('dashboard')} className={`flex items-center justify-between px-4 py-2 rounded-md cursor-pointer ${isActive('/admin/dashboard')} hover:text-white hover:bg-[#00A261] transition-colors text-sm duration-300 ease-in-out`}>
                        <div className="flex items-center space-x-2">
                            <AiOutlineDashboard className='text-lg' />
                            <span>Dashboard</span>
                        </div>
                        <div className={`transform transition-transform duration-300 ${expandedSections.dashboard ? 'rotate-180' : ''}`}>
                            <FaAngleDown className="text-sm" />
                        </div>
                    </div>
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.dashboard ? 'max-h-[500px]' : 'max-h-0'}`}>
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
                    </div>

                    {/* Question Banks Section */}
                    <Section name='Library' />
                    <div onClick={() => toggleSection('questionBanks')} className={`flex items-center justify-between px-4 py-2 rounded-md cursor-pointer ${isActive('/admin/question-banks')} hover:text-white hover:bg-[#00A261] transition-colors text-sm duration-300 ease-in-out`}>
                        <div className="flex items-center space-x-2">
                            <FaQuestionCircle className="text-lg" />
                            <span>Question Banks</span>
                        </div>
                        <div className={`transform transition-transform duration-300 ${expandedSections.questionBanks ? 'rotate-180' : ''}`}>
                            <FaAngleDown className="text-sm" />
                        </div>
                    </div>
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.questionBanks ? 'max-h-[500px]' : 'max-h-0'}`}>
                        <div className="pl-8 space-y-2">
                            <div onClick={() => navigateTo('/admin/questions')} className={`flex items-center space-x-1 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/questions')}`}>
                                <Dot />
                                <span>Questions</span>
                            </div>
                            <div onClick={() => navigateTo('/admin/add-questions')} className={`flex items-center space-x-1 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/add-questions')}`}>
                                <Dot />
                                <span>Add Question</span>
                            </div>
                            <div onClick={() => navigateTo('/admin/compreshensions')} className={`flex items-center space-x-1 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/compreshensions')}`}>
                                <Dot />
                                <span>Compreshensions</span>
                            </div>
                            <div onClick={() => navigateTo('/admin/question-types')} className={`flex items-center space-x-1 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/question-types')}`}>
                                <Dot />
                                <span>Question Types</span>
                            </div>
                        </div>
                    </div>

                    {/* Manage Categories Section */}
                    <Section name='Configuration' />
                    <div onClick={() => toggleSection('manageCategories')} className={`flex items-center justify-between px-4 py-2 rounded-md cursor-pointer ${isActive('/admin/manage-categories')} hover:text-white hover:bg-[#00A261] transition-colors duration-300 ease-in-out text-sm`}>
                        <div className="flex items-center space-x-2">
                            <AiOutlineTags className="text-lg" />
                            <span>Manage Categories</span>
                        </div>
                        <div className={`transform transition-transform duration-300 ${expandedSections.manageCategories ? 'rotate-180' : ''}`}>
                            <FaAngleDown className="text-sm" />
                        </div>
                    </div>
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.manageCategories ? 'max-h-[500px]' : 'max-h-0'}`}>
                        <div className="pl-8 space-y-2">
                            <div onClick={() => navigateTo('/admin/tags')} className={`flex items-center space-x-1 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/tags')}`}>
                                <Dot />
                                <span>Tags</span>
                            </div>
                        </div>
                    </div>

                    {/* Manage Subject Section */}
                    <div onClick={() => toggleSection('manageSubjects')} className={`flex items-center justify-between px-4 py-2 rounded-md cursor-pointer ${isActive('/admin/manage-categories')} hover:text-white hover:bg-[#00A261] transition-colors duration-300 ease-in-out text-sm`}>
                        <div className="flex items-center space-x-2">
                            <AiOutlineTags className="text-lg" />
                            <span>Manage Subjects</span>
                        </div>
                        <div className={`transform transition-transform duration-300 ${expandedSections.manageSubjects ? 'rotate-180' : ''}`}>
                            <FaAngleDown className="text-sm" />
                        </div>
                    </div>
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.manageSubjects ? 'max-h-[500px]' : 'max-h-0'}`}>
                        <div className="pl-8 space-y-2">
                            <div onClick={() => navigateTo('/admin/sections')} className={`flex items-center space-x-1 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/sections')}`}>
                                <Dot />
                                <span>Sections</span>
                            </div>
                            <div onClick={() => navigateTo('/admin/skills')} className={`flex items-center space-x-1 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/skills')}`}>
                                <Dot />
                                <span>Skills</span>
                            </div>
                            <div onClick={() => navigateTo('/admin/topics')} className={`flex items-center space-x-1 px-4 py-2 rounded-md cursor-pointer hover:text-white text-sm ${isActive('/admin/topics')}`}>
                                <Dot />
                                <span>Topics</span>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
}

const Section = ({ name }: { name: string }) => (
    <div className="flex items-center justify-start py-3 mt-6">
        <h3 className="font-bold text-xs tracking-wider uppercase px-3 text-slate-400">{name}</h3>
        <span className='w-[70%] h-[0.5px] bg-slate-600'></span>
    </div>
);
