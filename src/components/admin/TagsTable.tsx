'use client'
import { useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import DropdownMenu from "../DropDownMenu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { createTag, deleteTag, fetchTags, updateTag } from "@/redux/slices/configuration/manage-categories/tagsSlice";
import { Plus } from "lucide-react";
import Skeleton from 'react-loading-skeleton';
import Pagination from "../Pagination";
import { EditOrCreateNewModalWrapper } from "../EditOrCreateNewModalWrapper";
import SearchBar from "../SearchBar";
import StatusFilter from "../StatusFilter";

export default function TagsTable() {
    const dispatch = useDispatch<AppDispatch>();
    const { totalPages, totalTags, status, error } = useSelector((state: RootState) => state.tag);
    const [name, setName] = useState<string>(""); // Set initial tag name if provided
    const [isActive, setIsActive] = useState<boolean>(true); // Set initial status
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedTag, setSelectedTag] = useState<any | null>(null);
    const [loadingPage, setLoadingPage] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [pagesCache, setPagesCache] = useState<Record<number, any[]>>({}); // Cache to store page data
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

    const [filterQuery, setFilterQuery] = useState<any>({
        name: "",
        isActive: null
    });
    const [searchQuery, setSearchQuery] = useState({ name: "", isActive: null });

    const tags = pagesCache[currentPage] || []; // Get tags for the current page from cache

    console.log(tags, currentPage, totalPages);
    

    useEffect(() => {
        const fetchData = async () => {
            if (!pagesCache[currentPage]) {
                setLoadingPage(true);
                const response: any = await dispatch(fetchTags({ ...searchQuery, currentPage, itemsPerPage }));
                // Type guard to ensure response.payload has tags
                if (typeof response.payload !== 'string' && response.payload?.tags) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage]: response?.payload?.tags,
                    }));
                } else {
                    console.error("Unexpected response format", response.payload);
                }
                setLoadingPage(false);
            }

            // Preload next and previous pages
            preloadAdjacentPages(currentPage, itemsPerPage);
        };

        const preloadAdjacentPages = async (currentPage: number, itemsPerPage: number) => {
            // Preload next page if it exists
            if (currentPage < totalPages && !pagesCache[currentPage + 1]) {
                const nextPageResponse: any = await dispatch(fetchTags({ currentPage: currentPage + 1, itemsPerPage }));

                if (typeof nextPageResponse.payload !== 'string' && nextPageResponse.payload?.tags) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage + 1]: nextPageResponse?.payload?.tags,
                        // tags
                    }));
                }
            }
        };

        fetchData();
    }, [dispatch, searchQuery, currentPage, itemsPerPage, pagesCache, totalPages]);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prevPage => prevPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(prevPage => prevPage - 1);
    };

    const handleSearch = () => {
        setSearchQuery(filterQuery);
        setItemsPerPage(totalTags)
        setPagesCache({});  // Clear cache when a new search is applied
        setCurrentPage(1);
    }

    const handleItemsPerPageChange = (e: any) => {
        setPagesCache({})
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    }

    const handleCreateNewTag = () => {
        setName("")
        setSelectedTag(null)
        setModalVisible(true)
    }

    const handleSave = async () => {
        const tagData: any = { name, isActive }
        let response;
        setModalVisible(false);  // Close the modal after saving
        if (selectedTag) {
            // If editing a tag, dispatch the edit action
            response = await dispatch(updateTag({ ...selectedTag, ...tagData }));
        } else {
            // If creating a new tag, dispatch the create action
            response = await dispatch(createTag(tagData));
        }

        // Wait for the response to resolve
        if (response && response.payload && typeof response.payload !== 'string') {
            // Update the state to show the new/updated tag immediately
            const updatedTags = selectedTag
                ? tags.map(tag => tag._id === selectedTag._id ? { ...tag, ...tagData } : tag)
                : [...tags, response.payload]; // Add the new tag to the list

            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedTags
            }));
        }
    };

    const onEdit = (item: any) => {
        setSelectedTag(item); // Set the tag data for editing
        setName(item.tagName); // Set the existing tag name in state
        setIsActive(item.isActive);
        setModalVisible(true)// Show the modal
        setDropdownOpen(null);
    };

    const handleDelete = async (tagId: string) => {
        setDropdownOpen(null);
        const response = await dispatch(deleteTag(tagId));
        if (response?.payload) {
            // Remove the deleted tag from the list of tags
            const updatedTags = tags.filter(tag => tag._id !== tagId);

            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedTags
            }));
        }
    };

    const menuItems = (item: any) => [
        // { id: item._id, label: item.isActive ? 'Deactivate' : 'Activate', onClick: () => onEdit(item) },
        { id: item._id, label: 'Edit', onClick: () => onEdit(item) },
        { id: item._id, label: 'Delete', onClick: () => handleDelete(item._id) },
    ];

    if (status === 'failed') return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-600">Manage Tags</h2>
                <button
                    onClick={handleCreateNewTag}
                    className="bg-green_button text-white text-sm flex items-center px-4 py-2 rounded-lg shadow-md hover:bg-green_hover_button transition duration-200 ease-in-out"
                >
                    <Plus width={20} className="mr-2" /> Create New
                </button>
            </div>

            {/* Tags Table */}
            <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
                <thead className="bg-white">
                    <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Tag Name</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                </thead>
                <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left px-2 py-2 text-sm font-medium text-gray-600">
                            <SearchBar
                                filterQuery={filterQuery}
                                setFilterQuery={setFilterQuery}
                                placeHolder="Search name..."
                            />
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">
                            <StatusFilter filterQuery={filterQuery}
                                setFilterQuery={setFilterQuery} />
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">
                            <button
                                onClick={handleSearch}  // Trigger the search when clicked
                                className="bg-blue_button text-white px-4 py-1 rounded-md hover:bg-blue_hover_button"
                            >
                                Search
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {!loadingPage ? (
                        tags.length > 0 ? (
                            tags.map((tag: any) => (
                                <tr key={tag.id} className="border-t hover:bg-gray-50" style={{ height: '45px' }}>
                                    <td className="py-3 px-4 text-sm">{tag?.name}</td>
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
                        )
                            :
                            (
                                <tr>
                                    <td colSpan={2} className="text-center py-4 text-gray-500">No categories found</td>
                                </tr>
                            )
                    ) : (
                        Array.from({ length: itemsPerPage }).map((_, index) => (
                            <tr key={index} style={{ height: '45px' }}>
                                <td className="px-4 py-2 border-b"><Skeleton width={150} height={20} /></td>
                                <td className="px-4 py-2 border-b"><Skeleton width={50} height={20} /></td>
                                <td className="px-4 py-2 border-b"><Skeleton width={30} height={20} /></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalTags}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                handleItemPerPageChange={handleItemsPerPageChange}
            />

            <EditOrCreateNewModalWrapper
                title={selectedTag ? "Edit Tag" : "Create Tag"}
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
            >
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded shadow-sm text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={isActive ? "active" : "inactive"}
                        onChange={(e) => setIsActive(e.target.value === "active")}
                        className="w-full px-3 py-2 border rounded shadow-sm text-sm"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </EditOrCreateNewModalWrapper>
        </div>
    );
}