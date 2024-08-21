import { AiOutlineUser, AiOutlineSetting } from 'react-icons/ai';
import { MdLanguage } from 'react-icons/md';
import { BiMoon } from 'react-icons/bi';

interface SidebarProps {
    isSidebarOpen: boolean;
}

export default function Sidebar({ isSidebarOpen }: SidebarProps) {
    return (
        <div
            className={`h-screen w-64 bg-white shadow p-4 fixed z-50 transform transition-transform duration-300 ease-in-out 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}  // Hide sidebar on small screens by default
        >
            <div className="flex flex-col h-full justify-between">
                <div>
                    <a href="#" className="text-xl font-bold mb-4">
                        Logo
                    </a>
                    <div className="mt-4">
                        <nav className="space-y-2">
                            <a href="#" className="flex items-center space-x-2 hover:bg-gray-100 px-4 py-2 rounded-lg">
                                <AiOutlineUser className="text-gray-600" />
                                <span>Public Profile</span>
                            </a>
                            <a href="#" className="flex items-center space-x-2 hover:bg-gray-100 px-4 py-2 rounded-lg">
                                <AiOutlineUser className="text-gray-600" />
                                <span>My Profile</span>
                            </a>
                            <a href="#" className="flex items-center space-x-2 hover:bg-gray-100 px-4 py-2 rounded-lg">
                                <AiOutlineSetting className="text-gray-600" />
                                <span>My Account</span>
                            </a>
                            <a href="#" className="flex items-center space-x-2 hover:bg-gray-100 px-4 py-2 rounded-lg">
                                <AiOutlineSetting className="text-gray-600" />
                                <span>Dev Forum</span>
                            </a>
                            <a href="#" className="flex items-center justify-between hover:bg-gray-100 px-4 py-2 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <MdLanguage className="text-gray-600" />
                                    <span>Language</span>
                                </div>
                                <span className="text-sm text-gray-600">English</span>
                            </a>
                        </nav>
                    </div>
                </div>
                <div className="mt-8">
                    <a href="#" className="flex items-center space-x-2 hover:bg-gray-100 px-4 py-2 rounded-lg">
                        <BiMoon className="text-gray-600" />
                        <span>Dark Mode</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
