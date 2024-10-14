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
        manageSubjects: false
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentRoute(window.location.pathname);
        }
    }, []);

    const isActive = (route: string) => currentRoute === route ? 'bg-[#DB1430] text-white' : 'text-slate-300';

    const navigateTo = (path: string) => {
        setCurrentRoute(path);
        router.push(path);
    };

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className={`h-screen w-64 bg-[#181920] shadow-lg py-4 fixed z-50 transform transition-transform duration-500 ease-out overflow-y-auto scrollbar-custom ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="flex flex-col h-full">
                <LogoSection />

                <nav className="space-y-2 mb-4">
                    {/* Dashboard Section */}
                    <ExpandableSection
                        title="Dashboard"
                        icon={<AiOutlineDashboard className="text-lg" />}
                        isActive={isActive('/admin/dashboard')}
                        isExpanded={expandedSections.dashboard}
                        onClick={() => toggleSection('dashboard')}
                    >
                        <ChildNavItem
                            title="Home"
                            icon={<AiOutlineHome />}
                            route="/admin/dashboard"
                            isActive={isActive('/admin/dashboard')}
                            onClick={() => navigateTo('/admin/dashboard')}
                        />
                        <ChildNavItem
                            title="My Profile"
                            icon={<AiOutlineUser />}
                            route="/user/profile"
                            isActive={isActive('/user/profile')}
                            onClick={() => navigateTo('/user/profile')}
                        />
                    </ExpandableSection>

                    {/* Question Banks Section */}
                    <SectionDivider name='Library' />
                    <ExpandableSection
                        title="Question Banks"
                        icon={<FaQuestionCircle className="text-lg" />}
                        isActive={isActive('/admin/question-banks')}
                        isExpanded={expandedSections.questionBanks}
                        onClick={() => toggleSection('questionBanks')}
                    >
                        <ChildNavItem
                            title="Questions"
                            icon={<Dot />}
                            route="/admin/questions"
                            isActive={isActive('/admin/questions')}
                            onClick={() => navigateTo('/admin/questions')}
                        />
                        <ChildNavItem
                            title="Add Question"
                            icon={<Dot />}
                            route="/admin/question/new"
                            isActive={isActive('/admin/question/new')}
                            onClick={() => navigateTo('/admin/question/new')}
                        />
                        <ChildNavItem
                            title="Import Questions"
                            icon={<Dot />}
                            route="/admin/import-questions"
                            isActive={isActive('/admin/import-questions')}
                            onClick={() => navigateTo('/admin/import-questions')}
                        />
                        <ChildNavItem
                            title="Comprehensions"
                            icon={<Dot />}
                            route="/admin/comprehensions"
                            isActive={isActive('/admin/comprehensions')}
                            onClick={() => navigateTo('/admin/comprehensions')}
                        />
                        <ChildNavItem
                            title="Question Types"
                            icon={<Dot />}
                            route="/admin/question-types"
                            isActive={isActive('/admin/question-types')}
                            onClick={() => navigateTo('/admin/question-types')}
                        />
                    </ExpandableSection>

                    {/* Manage Categories Section */}
                    <SectionDivider name='Configuration' />
                    <ExpandableSection
                        title="Manage Categories"
                        icon={<AiOutlineTags className="text-lg" />}
                        isActive={isActive('/admin/manage-categories')}
                        isExpanded={expandedSections.manageCategories}
                        onClick={() => toggleSection('manageCategories')}
                    >
                        <ChildNavItem
                            title="Tags"
                            icon={<Dot />}
                            route="/admin/tags"
                            isActive={isActive('/admin/tags')}
                            onClick={() => navigateTo('/admin/tags')}
                        />
                    </ExpandableSection>

                    <ExpandableSection
                        title="Manage Subjects"
                        icon={<AiOutlineTags className="text-lg" />}
                        isActive={isActive('/admin/manage-subjects')}
                        isExpanded={expandedSections.manageSubjects}
                        onClick={() => toggleSection('manageSubjects')}
                    >
                        <ChildNavItem
                            title="Sections"
                            icon={<Dot />}
                            route="/admin/sections"
                            isActive={isActive('/admin/sections')}
                            onClick={() => navigateTo('/admin/sections')}
                        />
                        <ChildNavItem
                            title="Skills"
                            icon={<Dot />}
                            route="/admin/skills"
                            isActive={isActive('/admin/skills')}
                            onClick={() => navigateTo('/admin/skills')}
                        />
                        <ChildNavItem
                            title="Topics"
                            icon={<Dot />}
                            route="/admin/topics"
                            isActive={isActive('/admin/topics')}
                            onClick={() => navigateTo('/admin/topics')}
                        />
                    </ExpandableSection>
                </nav>
            </div>
        </div>
    );
}

const LogoSection = () => (
    <div className="mb-4 text-center">

        <span className="text-[#DB1430] text-2xl font-bold">Logo</span>
    </div>
);

const SectionDivider = ({ name }: { name: string }) => (
    <div className="flex items-center justify-start py-3 mt-6">
        <h3 className="font-bold text-xs tracking-wider uppercase px-3 text-slate-400">{name}</h3>
        <span className="w-[70%] h-[0.5px] bg-slate-600"></span>
    </div>
)

const ExpandableSection = ({
    title,
    icon,
    isActive,
    isExpanded,
    onClick,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    isActive: string;
    isExpanded: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <div>
        <div
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-2 cursor-pointer ${isActive} hover:text-white hover:bg-[#DB1430] transition-colors text-sm duration-300 ease-in-out`}
        >
            <div className="flex items-center space-x-2">
                {icon}
                <span>{title}</span>
            </div>
            <FaAngleDown
                className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
        </div>
        <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'
                }`}
        >
            <div className=" space-y-2">{children}</div>
        </div>
    </div>
)

const ChildNavItem = ({
    title,
    icon,
    isActive,
    onClick,
}: {
    title: string;
    icon: React.ReactNode;
    route: string;
    isActive: string;
    onClick: () => void;
}) => (
    <div
        onClick={onClick}
        className={`flex items-center space-x-1 px-4 pl-8 py-2 cursor-pointer text-slate-400 hover:text-white text-sm ${isActive}`}
    >
        {icon}
        <span>{title}</span>
    </div>
)