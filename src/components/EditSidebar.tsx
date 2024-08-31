import React, { useEffect, useRef } from 'react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    editData: any; // Adjust the type based on your edit data structure
}

const  EditSidebar: React.FC<SidebarProps> = ({ isOpen, onClose, editData }) => {
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close sidebar if clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40" onClick={onClose}></div>}
            
            <div
                ref={sidebarRef}
                className={`fixed top-0 right-0 w-80 bg-white h-full shadow-lg transform ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                } transition-transform duration-300 ease-in-out z-50 rounded-l-lg`}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-700">Edit Question Type</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800 focus:outline-none"
                        >
                            &times;
                        </button>
                    </div>
                    <form>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                defaultValue={editData?.typeName}
                                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                defaultValue={editData?.description}
                                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                            />
                        </div>
                        <div className="mb-4 flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={editData?.isActive} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700 transition"
                        >
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditSidebar;