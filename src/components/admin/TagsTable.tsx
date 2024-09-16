'use client'
import { useCallback, useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import DropdownMenu from "../DropDownMenu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { createTag, deleteTag, fetchTags, updateTag } from "@/redux/slices/configuration/manage-categories/tagsSlice";
import { Filter, Plus } from "lucide-react";
import Skeleton from 'react-loading-skeleton';
import Pagination from "../Pagination";
import { EditOrCreateNewModalWrapper } from "../EditOrCreateNewModalWrapper";
import SearchBar from "../SearchBar";
import StatusFilter from "../StatusFilter";
import SectionHeader from "../SectionHeader";
import FormInput from "../FormInput";
import FormSelect from "../FormSelect";
import TableLabelHeader from "../TableLabelHeader";
import SearchFilters from "../SearchFilters";

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

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) setCurrentPage(prevPage => prevPage + 1);
    }, [currentPage, totalPages]);

    const handlePreviousPage = useCallback(() => {
        if (currentPage > 1) setCurrentPage(prevPage => prevPage - 1);
    }, [currentPage]);

    const handleSearch = useCallback(() => {
        setSearchQuery(filterQuery);
        setItemsPerPage(totalTags);
        setPagesCache({});
        setCurrentPage(1);
    }, [filterQuery, totalTags]);

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
            setModalVisible(false);  // Close the modal after saving
        }
    };

    const onEdit = (item: any) => {
        setSelectedTag(item); // Set the tag data for editing
        setName(item.name); // Set the existing tag name in state
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

    const filterFields = [
        <SearchBar
            key="search"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="Search name..."
        />,
        <StatusFilter
            key="status"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
        />,
    ];

    return (
        <div className="container mx-auto p-4">
            {/* Header Section */}
            <SectionHeader title="Manage Tags" onClick={handleCreateNewTag} />
            {/* Tags Table */}
            <table className="min-w-full bg-white shadow-md rounded-sm">
                <TableLabelHeader headings={["Section Name", "Status", "Actions"]} />
                {/* Search Filters */}
                <SearchFilters filterFields={filterFields} onSearch={handleSearch} />
                <tbody>
                    {!loadingPage ? (
                        tags.length > 0 ? (
                            tags.map((tag: any) => (
                                <tr key={tag.id} className="border-t border-r border-gray-100 hover:bg-gray-50" style={{ height: '45px' }}>
                                    <td className="py-3 px-4 text-sm border-r border-gray-100">{tag?.name}</td>
                                    <td className="py-3 px-4 text-sm border-r border-gray-100">
                                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${tag.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>
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
                                    <td colSpan={2} className="text-center py-4 text-gray-500">No tags found</td>
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
                    <FormInput label="Tag Name" value={name} onChange={(e) => setName(e.target.value)} required={true} placeholder="Tag Name" />
                </div>

                <div className="mb-4">
                    <FormSelect
                        label="Status"
                        value={isActive ? "active" : "inactive"}
                        onChange={(e) => setIsActive(e.target.value === "active")}
                        options={[
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" }
                        ]}
                        className="my-custom-select-class"
                    />
                </div>
            </EditOrCreateNewModalWrapper>
        </div>
    );
}