'use client'

import { Filter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { EditOrCreateNewModalWrapper } from "@/components/EditOrCreateNewModalWrapper";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "@/redux/slices/configuration/manage-categories/categoriesSlice";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import DropdownMenu from "@/components/DropDownMenu";
import { FiMoreVertical } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import Pagination from "@/components/Pagination";
import StatusFilter from "@/components/StatusFilter";
import SearchBar from "@/components/SearchBar";
import SectionHeader from "@/components/SectionHeader";
import dynamic from "next/dynamic";
import TableLabelHeader from "@/components/TableLabelHeader";
import SearchFilters from "@/components/SearchFilters";
import { formatDate } from "@/utility/dateFormate";

const CKEditor = dynamic(() => import("@/components/CustomCKEditor").then((module) => module.default), { ssr: false })

export default function Page() {
    const dispatch = useDispatch<AppDispatch>()
    const { totalCategories, totalPages, status, error } = useSelector((state: RootState) => state.categories);
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [isActive, setIsActive] = useState<boolean>(true)
    const [isModalVisible, setModalVisible] = useState<boolean>(false)
    const [selectedCategory, setSelectedCategory] = useState<any | null>(null)
    const [loadingPage, setLoadingPage] = useState(true);
    const [content, setContent] = useState("");
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [pagesCache, setPagesCache] = useState<Record<number, any[]>>({}); // Cache to store page data
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [filterQuery, setFilterQuery] = useState<any>({
        name: "",
        isActive: null
    });
    const [searchQuery, setSearchQuery] = useState({ name: "", isActive: null });

    const categories = pagesCache[currentPage] || []

    useEffect(() => {
        const fetchData = async () => {
            if (!pagesCache[currentPage]) {
                setLoadingPage(true)
                const response: any = await dispatch(fetchCategories({ ...searchQuery, currentPage, itemsPerPage }))
                if (typeof response.payload !== 'string' && response.payload?.categories) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage]: response?.payload?.categories
                    }))
                } else {
                    console.log("Unexpected response formate : ", response.payload);
                }
                setLoadingPage(false);
            }

            // Preload next and previous pages
            preloadAdjacentPages(currentPage, itemsPerPage)
        }

        const preloadAdjacentPages = async (currentPage: number, itemsPerPage: number) => {
            // Preload next page if it exists
            if (currentPage < totalPages && !pagesCache[currentPage + 1]) {
                const nextPageResponse: any = await dispatch(fetchCategories({ currentPage: currentPage + 1, itemsPerPage }))

                if (typeof nextPageResponse.payload !== "string" && nextPageResponse.payload?.categories) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage + 1]: nextPageResponse?.payload?.categories
                    }))
                }
            }
        }
        fetchData();
    }, [dispatch, searchQuery, currentPage, itemsPerPage, pagesCache, totalPages])

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prevPage => prevPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(prevPage => prevPage - 1);
    };

    // Trigger search when button is clicked
    const handleSearch = () => {
        setSearchQuery(filterQuery);
        setItemsPerPage(totalCategories)
        setPagesCache({});  // Clear cache when a new search is applied
        setCurrentPage(1);  // Reset to the first page
    };

    const handleItemsPerPageChange = (e: any) => {
        setPagesCache({})
        setItemsPerPage(Number(e.target.value))
        setCurrentPage(1)
    }

    const handleCreateNewCategory = () => {
        setName("")
        setDescription("");
        setContent("");
        setSelectedCategory(null)
        setModalVisible(true)
    }

    const handleSave = async () => {
        const categoryData = { name, description, content, isActive };
        let response: any;
        if (selectedCategory) {
            // Update existing category
            response = await dispatch(updateCategory({ ...selectedCategory, ...categoryData }));
        } else {
            // Create new category
            response = await dispatch(createCategory(categoryData));
        }

        // Wait for the response to resolve
        if (response && response.payload && typeof response.payload !== 'string') {
            // Update the state to show the new/update tag immediately
            const updatedCategories: any = selectedCategory ? categories.map(cat => cat._id === selectedCategory._id ? { ...cat, ...categoryData } : cat) : [...categories, response.payload]

            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedCategories
            }))
            setModalVisible(false)
        }
    }

    // Handle editing an existing category
    const onEdit = (category: any) => {
        setSelectedCategory(category);
        setName(category.name);
        setDescription(category.description);
        setContent(category.content);
        setIsActive(category.isActive);
        setModalVisible(true);
        setDropdownOpen(null);
    };


    // Handle deleting a category
    const handleDelete = async (categoryId: string) => {
        try {
            setDropdownOpen(null);
            const response = await dispatch(deleteCategory(categoryId));
            if (response?.payload) {
                // Remove the deleted tag from the list of tags
                const updatedCategories = categories.filter(cat => cat._id !== categoryId);

                setPagesCache(prevCache => ({
                    ...prevCache,
                    [currentPage]: updatedCategories
                }));
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete category");
        }
    };

    const menuItems = (item: any) => [
        // { id: item._id, label: item.isActive ? 'Deactivate' : 'Activate', onClick: () => { } },
        { id: item._id, label: 'Edit', onClick: () => onEdit(item) },
        { id: item._id, label: 'Delete', onClick: () => handleDelete(item._id) },
    ];

    const filterFields = [
        <SearchBar
            key="name"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="Skill name..."
            fieldName="name" // Pass the key corresponding to the filter
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
            <SectionHeader title="Manage Categories" onClick={handleCreateNewCategory} />
            {/* Tags Table */}
            <table className="min-w-full bg-white shadow-md rounded-sm">
                <TableLabelHeader headings={["Skill Name", "Status", "Created at", "Actions"]} />
                <SearchFilters filterFields={filterFields} onSearch={handleSearch} />
                <tbody>
                    {
                        !loadingPage ? (
                            categories.length > 0 ? (
                                categories.map((item: any) => (
                                    <tr key={item.id} className="border-t hover:bg-gray-50" style={{ height: '45px' }}>
                                        <td className="py-3 px-4 text-sm border-r border-gray-100">{item?.name}</td>
                                        <td className="py-3 px-4 text-sm border-r border-gray-100">
                                            <span className={`py-1 px-1 rounded-sm text-xs font-medium ${item.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>
                                                {item.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 border-r border-gray-200 text-gray-400 text-xs">
                                            {formatDate(item?.createdAt)}
                                        </td>
                                        <td className="py-3 px-4 text-sm relative w-fit">
                                            <button
                                                className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                                onClick={() => setDropdownOpen(dropdownOpen === item._id ? null : item._id)}
                                            >
                                                <FiMoreVertical />
                                            </button>
                                            <DropdownMenu
                                                items={menuItems(item)}
                                                isOpen={dropdownOpen === item._id}
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
                                    <td className="px-4 py-2 border-b border-r border-gray-100"><Skeleton width={150} height={20} /></td>
                                    <td className="px-4 py-2 border-b border-r border-gray-100"><Skeleton width={50} height={20} /></td>
                                    <td className="px-4 py-2 border-b border-r border-gray-100"><Skeleton width={50} height={20} /></td>
                                    <td className="px-4 py-2 border-b"><Skeleton width={30} height={20} /></td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalCategories}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                handleItemPerPageChange={handleItemsPerPageChange}
            />

            <EditOrCreateNewModalWrapper
                title={selectedCategory ? "Edit Category" : "Create Category"}
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                size="large"
            >
                {/* Name Field */}
                <div className="form-group mb-5">
                    <label className="block font-semibold text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="Enter category name"
                        required
                    />
                </div>

                {/* Description Field */}
                <div className="form-group mb-5">
                    <label className="block font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="Enter category description (optional)"
                        rows={4}
                    />
                </div>

                {/* Content Field */}
                <div className="form-group mb-5">
                    <label className="block font-semibold text-gray-700 mb-2">Content</label>
                    <CKEditor
                        content={content}
                        setContent={setContent}
                    />
                </div>

                {/* isActive Toggle */}
                <div className="form-group flex items-center space-x-3">
                    <label className="block font-semibold text-gray-700">Is Active</label>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-6 h-6 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </EditOrCreateNewModalWrapper>
        </div >
    )
}