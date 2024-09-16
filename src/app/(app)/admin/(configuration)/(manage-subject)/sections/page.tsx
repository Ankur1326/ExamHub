'use client'
import { useCallback, useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Skeleton from 'react-loading-skeleton';
import { createSection, deleteSection, fetchSections, updateSection } from "@/redux/slices/configuration/manage-subjects/sectionsSlice";
import SectionHeader from "@/components/SectionHeader";
import SearchBar from "@/components/SearchBar";
import StatusFilter from "@/components/StatusFilter";
import DropdownMenu from "@/components/DropDownMenu";
import Pagination from "@/components/Pagination";
import { EditOrCreateNewModalWrapper } from "@/components/EditOrCreateNewModalWrapper";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import FormTextarea from "@/components/FormTextarea";
import TableLabelHeader from "@/components/TableLabelHeader";
import SearchFilters from "@/components/SearchFilters";
import { formatDate } from "@/utility/dateFormate";

export default function Page() {
    const dispatch = useDispatch<AppDispatch>();
    const { totalPages = 1, totalSections, status, error } = useSelector((state: RootState) => state.sections);
    const [name, setName] = useState<string>(""); // Set initial section name if provided
    const [isActive, setIsActive] = useState<boolean>(true); // Set initial status
    const [shortDescription, setShortDescription] = useState<string>(""); // Set initial status
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedSection, setSelectedSection] = useState<any | null>(null);
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

    const sections = pagesCache[currentPage] || []; // Get sections for the current page from cache

    useEffect(() => {
        const fetchData = async () => {
            if (!pagesCache[currentPage]) {
                setLoadingPage(true);
                const response: any = await dispatch(fetchSections({ ...searchQuery, currentPage, itemsPerPage }));
                if (typeof response.payload !== 'string' && response.payload?.sections) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage]: response?.payload?.sections,
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
                const nextPageResponse: any = await dispatch(fetchSections({ currentPage: currentPage + 1, itemsPerPage }));

                if (typeof nextPageResponse.payload !== 'string' && nextPageResponse.payload?.sections) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage + 1]: nextPageResponse?.payload?.sections,
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
        setItemsPerPage(totalSections);
        setPagesCache({});
        setCurrentPage(1);
    }, [filterQuery, totalSections]);

    const handleItemsPerPageChange = (e: any) => {
        setPagesCache({})
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    }

    const handleCreateNewSection = () => {
        setName("")
        setSelectedSection(null)
        setModalVisible(true)
    }

    const handleSave = async (e: any) => {
        e.preventDefault()
        const sectionData: any = { name, shortDescription, isActive }
        let response;
        if (selectedSection) {
            // If editing a section, dispatch the edit action
            response = await dispatch(updateSection({ ...selectedSection, ...sectionData }));
        } else {
            // If creating a new section, dispatch the create action
            response = await dispatch(createSection(sectionData));
        }

        // Wait for the response to resolve
        if (response && response.payload && typeof response.payload !== 'string') {
            // Update the state to show the new/updated section immediately
            const updatedSections = selectedSection
                ? sections.map(section => section._id === selectedSection._id ? { ...section, ...sectionData } : section)
                : [...sections, response.payload]; // Add the new section to the list

            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedSections
            }));
            setModalVisible(false);  // Close the modal after saving
        }
    };

    const onEdit = (item: any) => {
        setSelectedSection(item); // Set the section data for editing
        setName(item.name); // Set the existing section name in state
        setShortDescription(item.shortDescription);
        setIsActive(item.isActive);
        setModalVisible(true)// Show the modal
        setDropdownOpen(null);
    };

    const handleDelete = async (sectionId: string) => {
        setDropdownOpen(null);
        const response = await dispatch(deleteSection(sectionId));
        if (response?.payload) {
            // Remove the deleted section from the list of sections
            const updatedSections = sections.filter(section => section._id !== sectionId);

            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedSections
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
            key="name"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="Section name..."
            fieldName="name" // Pass the key corresponding to the filter
        />,
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
            <SectionHeader title="Manage Sections" onClick={handleCreateNewSection} />
            {/* Sections Table */}
            <table className="min-w-full bg-white shadow-md rounded-sm">
                <TableLabelHeader headings={["Section Name",  "Status","Created at", "Actions"]} />
                {/* Search Filters */}
                <SearchFilters filterFields={filterFields} onSearch={handleSearch} />
                <tbody>
                    {!loadingPage ? (
                        sections.length > 0 ? (
                            sections.map((item: any) => (
                                <tr key={item.id} className="border-t border-r border-gray-100 hover:bg-gray-50" style={{ height: '45px' }}>
                                    <td className="py-3 px-4 text-sm border-r border-gray-100">{item?.name}</td>
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
                                    <td colSpan={2} className="text-center py-4 text-gray-500">No sections found</td>
                                </tr>
                            )
                    ) : (
                        Array.from({ length: itemsPerPage }).map((_, index) => (
                            <tr key={index} style={{ height: '45px' }}>
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
                totalItems={totalSections}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                handleItemPerPageChange={handleItemsPerPageChange}
            />

            <EditOrCreateNewModalWrapper
                title={selectedSection ? "Edit Section" : "Create Section"}
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                size="medium"
            >
                <div className="mb-4">
                    <FormInput label="Section Name" value={name} onChange={(e) => setName(e.target.value)} required={true} placeholder="name" />
                </div>

                <div className="mb-4">
                    <FormTextarea
                        label="Short Description"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        required={false}
                        rows={6}
                        placeholder="Enter a detailed description..."
                    />
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