'use client'
import { useCallback, useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Skeleton from 'react-loading-skeleton';
import SectionHeader from "@/components/SectionHeader";
import SearchBar from "@/components/SearchBar";
import StatusFilter from "@/components/StatusFilter";
import DropdownMenu from "@/components/DropDownMenu";
import Pagination from "@/components/Pagination";
import { EditOrCreateNewModalWrapper } from "@/components/EditOrCreateNewModalWrapper";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import TableLabelHeader from "@/components/TableLabelHeader";
import SearchFilters from "@/components/SearchFilters";
import { formatDate } from "@/utility/dateFormate";
import { createCompreshension, deleteCompreshension, fetchCompreshensions, updateCompreshension } from "@/redux/slices/library/question-bank/CompreshensionSlice";
import dynamic from "next/dynamic";
const CustomCKEditor = dynamic(() => import("@/components/CustomCKEditor"), { ssr: false });

export default function Page() {
    const dispatch = useDispatch<AppDispatch>();
    const { totalPages = 1, totalCompreshensions } = useSelector((state: RootState) => state.compreshensions);
    const [title, setTitle] = useState<string>("");
    const [body, setBody] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(true);

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedCompreshension, setSelectedCompreshension] = useState<any | null>(null);
    const [loadingPage, setLoadingPage] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [pagesCache, setPagesCache] = useState<Record<number, any[]>>({}); // Cache to store page data
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

    const [filterQuery, setFilterQuery] = useState<any>({
        title: "",
        isActive: null
    });
    const [searchQuery, setSearchQuery] = useState<any>({ title: "", isActive: null });

    const compreshensions = pagesCache[currentPage] || []; // Get items for the current page from cache

    useEffect(() => {
        const fetchData = async () => {
            if (!pagesCache[currentPage]) {
                setLoadingPage(true);
                const response: any = await dispatch(fetchCompreshensions({ ...searchQuery, currentPage, itemsPerPage }));
                if (typeof response.payload !== 'string' && response.payload?.compreshensions) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage]: response?.payload?.compreshensions,
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
                const nextPageResponse: any = await dispatch(fetchCompreshensions({ currentPage: currentPage + 1, itemsPerPage }));

                if (typeof nextPageResponse.payload !== 'string' && nextPageResponse.payload?.compreshensions) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage + 1]: nextPageResponse?.payload?.compreshensions,
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
        setItemsPerPage(totalCompreshensions);
        setPagesCache({});
        setCurrentPage(1);
    }, [filterQuery, totalCompreshensions]);

    const handleItemsPerPageChange = (e: any) => {
        setPagesCache({})
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    }

    const handleCreateNewCompreshension = () => {
        setTitle("")
        setSelectedCompreshension(null)
        setModalVisible(true)
    }

    const handleSave = async (e: any) => {
        e.preventDefault()
        const compreshensionData: any = { title, body, isActive }
        if (!title) {
            return;
        }
        if (!body) {
            return;
        }
        setModalVisible(false);
        let response;
        if (selectedCompreshension) {
            // If editing a item, dispatch the edit action
            response = await dispatch(updateCompreshension({ ...selectedCompreshension, ...compreshensionData }));
        } else {
            // If creating a new item, dispatch the create action
            response = await dispatch(createCompreshension(compreshensionData));
        }

        // Wait for the response to resolve
        if (response && response.payload && typeof response.payload !== 'string') {
            // Update the state to show the new/updated item immediately
            const updatedCompreshensions = selectedCompreshension
                ? compreshensions.map(com => com._id === selectedCompreshension._id ? { ...com, ...compreshensionData } : com)
                : [...compreshensions, response.payload]; // Add the new item to the list

            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedCompreshensions
            }));
        }
    };

    const onEdit = (item: any) => {
        setSelectedCompreshension(item); // Set the item data for editing
        setTitle(item.title); // Set the existing item name in state
        setBody(item.body);
        setIsActive(item.isActive);
        setModalVisible(true)// Show the modal
        setDropdownOpen(null);
    };

    const handleDelete = async (compreshensionId: string) => {
        setDropdownOpen(null);
        const response = await dispatch(deleteCompreshension(compreshensionId));
        if (response?.payload) {
            // Remove the deleted item from the list of items
            const updatedCompreshensions = compreshensions.filter(com => com._id !== compreshensionId);

            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedCompreshensions
            }));
        }
    };

    const menuItems = (item: any) => [
        // { id: item._id, label: item.isActive ? 'Deactivate' : 'Activate', onClick: () => onEdit(item) },
        { id: item._id, label: 'Edit', onClick: () => onEdit(item) },
        { id: item._id, label: 'Delete', onClick: () => handleDelete(item._id) },
    ];

    const filterFields = [
        <SearchBar
            key="title"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="title..."
            fieldName="title" // Pass the key corresponding to the filter
        />,
        <></>,
        <StatusFilter
            key="status"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
        />,
        <></>,
    ];

    return (
        <div className="container mx-auto p-4">
            {/* Header Section */}
            <SectionHeader title="Manage Sections" onClick={handleCreateNewCompreshension} />

            {/* items Table */}
            <table className="min-w-full bg-white shadow-md rounded-sm">
                <TableLabelHeader headings={["Title", "body", "Status", "Created at", "Actions"]} />
                {/* Search Filters */}
                <SearchFilters filterFields={filterFields} onSearch={handleSearch} />
                <tbody>
                    {!loadingPage ? (
                        compreshensions.length > 0 ? (
                            compreshensions.map((item: any) => (
                                <tr key={item.id} className="border-t border-r border-gray-100 hover:bg-gray-50" style={{ height: '45px' }}>
                                    <td className="py-3 px-4 text-sm border-r border-gray-100">{item?.title}</td>
                                    <td className="py-3 px-3 text-sm border-r border-gray-100">
                                        {/* Render HTML content from the question field */}
                                        <div
                                            dangerouslySetInnerHTML={{ __html: item?.body }}
                                        />
                                    </td>
                                    <td className="py-3 px-4 text-sm border-r border-gray-100">
                                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${item.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>
                                            {item.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-r text-gray-400 text-xs">{formatDate(item?.createdAt)}</td>
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
                                    <td colSpan={2} className="text-center py-4 text-gray-500"> Compreshensions not found</td>
                                </tr>
                            )
                    ) : (
                        Array.from({ length: itemsPerPage }).map((_, index) => (
                            <tr key={index} style={{ height: '45px' }}>
                                <td className="px-4 py-2 border-b border-r border-gray-200"><Skeleton width={150} height={20} /></td>
                                <td className="px-4 py-2 border-b border-r border-gray-200"><Skeleton width={150} height={20} /></td>
                                <td className="px-4 py-2 border-b border-r border-gray-200"><Skeleton width={60} height={20} /></td>
                                <td className="px-4 py-2 border-b border-r border-gray-200"><Skeleton width={80} height={20} /></td>
                                <td className="px-4 py-2 border-b border-r border-gray-200"><Skeleton width={30} height={20} /></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalCompreshensions}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                handleItemPerPageChange={handleItemsPerPageChange}
            />

            <EditOrCreateNewModalWrapper
                title={selectedCompreshension ? "Edit Compreshension" : "Create Compreshension"}
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                size="medium"
            >
                <div className="mb-4">
                    <FormInput label="Compreshension Name" value={title} onChange={(e) => setTitle(e.target.value)} required={true} placeholder="title" />
                </div>

                <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700">Body</label>
                    <CustomCKEditor content={body} setContent={setBody} />
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