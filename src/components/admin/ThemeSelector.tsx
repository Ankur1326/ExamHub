'use client'
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMonitor } from 'react-icons/fi';
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import KtIcon from '../KtIcon';

const ThemeSelector = () => {
    const { theme, setTheme } = useTheme();
    const menuRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility

    // Handle hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle click to toggle dropdown visibility
    const handleDropdownToggle = () => {
        setIsOpen(!isOpen); // Toggle dropdown open/close
    };

    const closeMenu = useCallback(() => {
        setIsOpen(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeMenu]);

    if (!mounted) return null;

    return (
        <div className="relative inline-block text-left">
            <div>
                {/* Button to toggle dropdown */}
                <button
                    onClick={handleDropdownToggle} // Toggle dropdown on button click
                    className="text-2xl font-medium text-slate-400 hover:text-gray-600 dark:hover:text-white"
                >
                    {/* Theme Icon based on current theme */}
                    {theme === 'light' && <KtIcon size={25} className="text-gray-400 hover:text-gray-600" filePath="/media/icons/duotune/general/gen060.svg" />}
                    {theme === 'dark' && <KtIcon size={25} className="text-gray-400 hover:text-white" filePath="/media/icons/duotune/general/gen061.svg" />}
                    {theme === 'system' &&  <KtIcon size={25} className="text-gray-600 dark:text-gray-300 dark:hover:text-white" filePath="/media/icons/duotune/electronics/elc004.svg" />}
                </button>
            </div>

            {/* Dropdown options */}
            {isOpen && ( // Show dropdown only if isOpen is true
                <div ref={menuRef} className="absolute right-0 z-10 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-bg_secondary ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                            className={`flex items-center px-4 py-2 text-sm w-full dark:text-text_secondary ${theme === 'light' ? 'bg-gray-100 dark:bg-bg_primary' : ''} hover:bg-gray-100 dark:hover:bg-bg_primary`}
                            onClick={() => {
                                setTheme('light');
                                setIsOpen(false); // Close dropdown after selecting
                            }}
                        >
                            <HiOutlineSun className="w-5 h-5 text-yellow-500" />
                            <span className="ml-2">Light</span>
                        </button>

                        <button
                            className={`flex items-center px-4 py-2 text-sm w-full dark:text-text_secondary ${theme === 'dark' ? 'bg-gray-100 dark:bg-bg_primary' : ''} hover:bg-gray-100 dark:hover:bg-bg_primary`}
                            onClick={() => {
                                setTheme('dark');
                                setIsOpen(false); // Close dropdown after selecting
                            }}
                        >
                            <HiOutlineMoon className="w-5 h-5 text-gray-500" />
                            <span className="ml-2">Dark</span>
                        </button>

                        <button
                            className={`flex items-center px-4 py-2 text-sm w-full dark:text-text_secondary ${theme === 'system' ? 'bg-gray-100 dark:bg-bg_primary' : ''} hover:bg-gray-100 dark:hover:bg-bg_primary`}
                            onClick={() => {
                                setTheme('system');
                                setIsOpen(false); // Close dropdown after selecting
                            }}
                        >
                            <FiMonitor className="w-5 h-5 text-blue-500" />
                            <span className="ml-2">System</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSelector;