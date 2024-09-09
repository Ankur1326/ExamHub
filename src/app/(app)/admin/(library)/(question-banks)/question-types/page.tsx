'use client'
import DropdownMenu from '@/components/DropDownMenu';
import DropDownMenu from '@/components/DropDownMenu';
import EditSidebar from '@/components/EditSidebar';
import { fetchQuestionTypes, toggleQuestionTypeStatus } from '@/redux/slices/library/question-bank/questionTypeSlice';
import { AppDispatch, RootState } from '@/redux/store';
import React, { useEffect, useRef, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import { useDispatch, useSelector } from 'react-redux';

const QuestionTypesPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const { questionTypes, status, error } = useSelector((state: RootState) => state.questionTypes);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchQuestionTypes());
    }, [dispatch]);

    const handleToggleStatus = (id: string) => {
        dispatch(toggleQuestionTypeStatus({ id }));
        setDropdownOpen(null)
    };

    const handleDropdownToggle = (index: any) => {
        setDropdownOpen(dropdownOpen === index ? null : index);
    };

    const handleEdit = (type: any) => {
        setEditData(type); // Set the data to be edited
        setSidebarOpen(true); // Open the sidebar
        setDropdownOpen(null);
    };

    const handleDelete = (type: string) => {
        // Handle delete action here
        console.log("Delete:", type);
        setDropdownOpen(null);
    };

    const handleSidebarClose = () => {
        setSidebarOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setDropdownOpen(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    const menuItems = (type: any) => [
        // { id: type._id, label: 'Edit', onClick: () => handleEdit(type) },
        // { id: type._id, label: 'Delete', onClick: () => handleDelete(type._id) },
        { id: type._id, label: type.isActive ? 'Deactivate' : 'Activate', onClick: () => handleToggleStatus(type._id) },
    ];


    if (status === 'failed') return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="container mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Question Types</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"></th>
                                    <th className="px-4 py-2 border-b-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-2 border-b-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                                    <th className="px-4 py-2 border-b-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2 border-b-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {status === 'succeeded' ? (
                                    questionTypes.map((type: any, index: number) => (
                                        <tr key={index} className={`cursor-default ${(index + 1) % 2 === 0 ? 'bg-gray-100' : ""} }`} >
                                            <td className="px-4 py-2 border-b text-sm text-gray-700">{index + 1}</td>
                                            <td className="px-4 py-2 border-b text-sm text-gray-700">{type.typeName}</td>
                                            <td className="px-4 py-2 border-b text-sm text-gray-700">{type.description}</td>
                                            <td className="px-4 py-2 border-b text-sm text-gray-700">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${type.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {type.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border-b text-sm text-gray-700 relative">
                                                <button
                                                    className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                                    onClick={() => setDropdownOpen(dropdownOpen === index ? null : index)}
                                                >
                                                    <FiMoreVertical />
                                                </button>
                                                <DropdownMenu
                                                    items={menuItems(type)}
                                                    isOpen={dropdownOpen === index}
                                                    onClose={() => setDropdownOpen(null)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 border-b"><Skeleton width={24} /></td>
                                            <td className="px-4 py-2 border-b"><Skeleton width={150} /></td>
                                            <td className="px-4 py-2 border-b"><Skeleton width={250} /></td>
                                            <td className="px-4 py-2 border-b"><Skeleton width={75} /></td>
                                            <td className="px-4 py-2 border-b"><Skeleton width={40} /></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <EditSidebar isOpen={sidebarOpen} onClose={handleSidebarClose} editData={editData} />
        </div>
    )

}

export default QuestionTypesPage