'use client'
import { useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import DropdownMenu from "../DropDownMenu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { createTag, deleteTag, editTag, fetchTags } from "@/redux/slices/configuration/manage-categories/tagSlice";
import { Plus } from "lucide-react";
import Skeleton from 'react-loading-skeleton';
import Pagination from "../Pagination";

export default function TagsTable() {
    const dispatch = useDispatch<AppDispatch>();
    const { tags, totalPages, totalTags, status, error } = useSelector((state: RootState) => state.tag);
    const [showModal, setShowModal] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<any | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [tagsPerPage, setTagsPerPage] = useState(5); // Customize the number of items per page
    const [searchQuery, setSearchQuery] = useState<string>("");

    console.log(tags, totalPages, totalTags, status, error);
    

    useEffect(() => {
        dispatch(fetchTags({ currentPage, tagsPerPage }));
    }, [dispatch, currentPage, tagsPerPage, searchQuery]);

    const handleNextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const onEdit = (item: any) => {
        setSelectedTag(item); // Set the tag data for editing
        setShowModal(true);   // Show the modal
        setDropdownOpen(null);
    };

    const handleSave = (updatedTag: any) => {
        if (selectedTag) {
            dispatch(editTag({ ...selectedTag, ...updatedTag, id: selectedTag._id })); // Dispatch the edit action
        } else {
            // If there's no selected tag, we're creating a new tag
            dispatch(createTag(updatedTag));
        }
        setShowModal(false);  // Close the modal after saving
    };

    const handleDelete = (tagId: string) => {
        dispatch(deleteTag({ _id: tagId }));
        setDropdownOpen(null)
    };

    const menuItems = (item: any) => [
        { id: item._id, label: item.isActive ? 'Deactivate' : 'Activate', onClick: () => onEdit(item) },
        { id: item._id, label: 'Edit', onClick: () => onEdit(item) },
        { id: item._id, label: 'Delete', onClick: () => handleDelete(item._id) },
    ];

    if (status === 'failed') return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <h2 className="text-3xl font-bold text-gray-600">Manage Tags</h2>
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                </div>
                <button
                    onClick={() => { setSelectedTag(null); setShowModal(true); }}
                    className="bg-green_button text-white text-sm flex items-center px-4 py-2 rounded-lg shadow-md hover:bg-green_hover_button transition duration-200 ease-in-out"
                >
                    <Plus width={20} className="mr-2" /> Create New
                </button>
            </div>

            {/* Tags Table */}
            <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Tag Name</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {status === 'succeeded' ? (
                        tags.map((tag: any) => (
                            <tr key={tag.id} className="border-t hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm">{tag?.tagName}</td>
                                <td className="py-3 px-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${tag.isActive ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"}`}>
                                        {tag.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm relative w-fit">
                                    <button
                                        className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                        onClick={() => setDropdownOpen(dropdownOpen === tag._id ? null : tag._id)}
                                    >
                                        <FiMoreVertical />
                                    </button>
                                    <DropdownMenu
                                        items={menuItems(tag)}
                                        isOpen={dropdownOpen === tag._id}
                                        onClose={() => setDropdownOpen(null)}
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        Array.from({ length: tagsPerPage }).map((_, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2 border-b"><Skeleton width={24} height={20} /></td>
                                <td className="px-4 py-2 border-b"><Skeleton width={150} height={20} /></td>
                                <td className="px-4 py-2 border-b"><Skeleton width={40} height={20} /></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={tags.length}
                totalItems={totalTags}
                setItemsPerPage={setTagsPerPage}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
            />

            {/* Modal for creating/editing tag */}
            {showModal && (
                <TagModal
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    initialData={selectedTag}
                />
            )}
        </div>
    );
}

interface TagModalProps {
    onClose: () => void;
    onSave: (tag: { tagName: string; isActive: boolean }) => void;
    initialData?: { tagName: string; isActive: boolean }; // Optional initial data for editing
}

function TagModal({ onClose, onSave, initialData }: TagModalProps) {
    const [tagName, setTagName] = useState<string>(initialData?.tagName || ""); // Set initial tag name if provided
    const [isActive, setIsActive] = useState<boolean>(initialData?.isActive ?? true); // Set initial status

    const handleSave = () => {
        onSave({ tagName, isActive });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">{initialData ? "Edit Tag" : "Create Tag"}</h3>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
                    <input
                        type="text"
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value)}
                        className="w-full px-3 py-2 border rounded shadow-sm text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={isActive ? 'active' : 'inactive'}
                        onChange={(e) => setIsActive(e.target.value === 'active')}
                        className="w-full px-3 py-2 border rounded shadow-sm text-sm"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-400">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Save</button>
                </div>
            </div>
        </div>
    );
}
