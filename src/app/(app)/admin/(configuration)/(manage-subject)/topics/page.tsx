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
import FormTextarea from "@/components/FormTextarea";
import TableLabelHeader from "@/components/TableLabelHeader";
import SearchFilters from "@/components/SearchFilters";
import SearchDropdown from "@/components/SearchDropdown";
import { fetchSections } from "@/redux/slices/configuration/manage-subjects/sectionsSlice";
import { formatDate } from "@/utility/dateFormate";
import { createTopic, deleteTopic, fetchTopics, updateTopic } from "@/redux/slices/configuration/manage-subjects/topicSlice";
import { fetchSkills } from "@/redux/slices/configuration/manage-subjects/skillsSlice";

export default function Page() {
    const dispatch = useDispatch<AppDispatch>();
    const { totalPages, totalTopics, status, error } = useSelector((state: RootState) => state.topics);
    const [name, setName] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [skillName, setSkillName] = useState<string>("");
    const [shortDescription, setShortDescription] = useState<string>("");
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
    const [loadingPage, setLoadingPage] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [pagesCache, setPagesCache] = useState<Record<number, any[]>>({}); // Cache to store page data
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

    const [filterQuery, setFilterQuery] = useState<any>({
        name: "",
        skillName: "",
        isActive: null
    });
    const [searchQuery, setSearchQuery] = useState({ name: "", skillName: "", isActive: null });

    const topics = pagesCache[currentPage] || [];

    useEffect(() => {
        const fetchData = async () => {
            if (!pagesCache[currentPage]) {
                setLoadingPage(true);
                const response: any = await dispatch(fetchTopics({ ...searchQuery, currentPage, itemsPerPage }));
                if (typeof response.payload !== 'string' && response.payload?.topics) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage]: response?.payload?.topics,
                    }));
                } else {
                    console.error("Unexpected response format", response.payload);
                }
                // console.log("response?.payload?.topics : ", response?.payload?.topics);

                setLoadingPage(false);
            }

            // Preload next and previous pages
            preloadAdjacentPages(currentPage, itemsPerPage);
        };

        const preloadAdjacentPages = async (currentPage: number, itemsPerPage: number) => {
            // Preload next page if it exists
            if (currentPage < totalPages && !pagesCache[currentPage + 1]) {
                const nextPageResponse: any = await dispatch(fetchTopics({ currentPage: currentPage + 1, itemsPerPage }));

                if (typeof nextPageResponse.payload !== 'string' && nextPageResponse.payload?.topics) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage + 1]: nextPageResponse?.payload?.topics,
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
        setItemsPerPage(totalTopics);
        setPagesCache({});
        setCurrentPage(1);
    }, [filterQuery, totalTopics]);

    const handleItemsPerPageChange = (e: any) => {
        setPagesCache({})
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    }

    const handleCreateNewItem = () => {
        setName("")
        setSelectedTopic(null)
        setModalVisible(true)
    }

    const handleSave = async (e: any) => {
        e.preventDefault()
        const topicData: any = { name, skillName, shortDescription, isActive }
        if (!name && !skillName) {
            return;
        }
        setModalVisible(false);
        let response;
        if (selectedTopic) {
            // If editing a skill, dispatch the edit action
            response = await dispatch(updateTopic({ ...selectedTopic, ...topicData }));
        } else {
            // If creating a new skill, dispatch the create action
            response = await dispatch(createTopic(topicData));
        }

        // Wait for the response to resolve
        if (response && response.payload && typeof response.payload !== 'string') {
            // Update the state to show the new/updated item immediately
            const newTopic = response.payload
            const updatedTopics = selectedTopic
                ? topics.map(topic => topic._id === selectedTopic._id ? { ...topic, ...newTopic } : topic)
                : [...topics, response.payload]; // Add the new item to the list

            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedTopics
            }));
        }
    };

    const onEdit = (item: any) => {
        setSelectedTopic(item);
        // Set the item data for editing
        setName(item.name); // Set the existing item name in state
        setSkillName(item.skillDetails.name); // Set the existing item name in state
        setShortDescription(item.shortDescription);
        setIsActive(item.isActive);
        setModalVisible(true)// Show the modal
        setDropdownOpen(null);
    };

    const handleDelete = async (topicId: string) => {
        setDropdownOpen(null);
        const response = await dispatch(deleteTopic(topicId));
        if (response && response.payload && typeof response.payload !== 'string') {
            // Remove the deleted item from the list of items
            const updatedTopics = topics.filter(topic => topic._id !== topicId);

            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedTopics
            }));
        }
    };

    const menuItems = (item: any) => [
        // { id: item._id, label: item.isActive ? 'Deactivate' : 'Activate', onClick: () => onEdit(item) },
        { id: item._id, label: 'Edit', onClick: () => onEdit(item) },
        { id: item._id, label: 'Delete', onClick: () => handleDelete(item._id) },
    ];

    // if (status === 'failed') return <div>Error: {error}</div>;

    const filterFields = [
        <SearchBar
            key="name"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="Topic name..."
            fieldName="name" // Pass the key corresponding to the filter
        />,
        <SearchBar
            key="skillName"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="Skill name..."
            fieldName="skillName" // Pass the key corresponding to the section filter
        />,
        <StatusFilter
            key="status"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
        />,
    ];

    const fetchAllActiveItems = async (searchQuery: string, fetchAll: boolean) => {
        const response = await dispatch(fetchSkills({ name: searchQuery, fetchAll, isActive: true }));
        return response.payload.skills || [];
    };

    return (
        <div className="container mx-auto p-4">
            {/* Header Skill */}
            <SectionHeader title="Manage Topics" onClick={handleCreateNewItem} />
            {/* Skill Table */}
            <table className="min-w-full bg-white shadow-md rounded-sm">
                <TableLabelHeader headings={["Skill Name", "Skills", "Status", "Actions"]} />
                {/* Search Filters */}
                <SearchFilters filterFields={filterFields} onSearch={handleSearch} />

                <tbody>
                    {!loadingPage ? (
                        topics.length > 0 ? (
                            topics.map((item: any) => (
                                <tr key={item.id} className="border-t border-r border-gray-100 hover:bg-gray-50" style={{ height: '45px' }}>
                                    <td className="py-4 px-6 text-sm border-r border-gray-200 text-gray-700">
                                        <div className="flex flex-col">
                                            <span className="font-medium truncate">{item?.name}</span>
                                            <span className="text-gray-400 text-xs">{formatDate(item?.createdAt)}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm border-r border-gray-200 text-gray-700">
                                        <div className="flex flex-col">
                                            <span className="font-medium truncate">{item?.skillDetails?.name}</span>
                                            <span className="text-gray-400 text-xs">{formatDate(item?.skillDetails?.createdAt)}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm border-r border-gray-100">
                                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${item.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>
                                            {item.isActive ? "Active" : "Inactive"}
                                        </span>
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
                                    <td colSpan={2} className="text-center py-4 text-gray-500">No skills found</td>
                                </tr>
                            )
                    ) : (
                        Array.from({ length: itemsPerPage }).map((_, index) => (
                            <tr key={index} style={{ height: '45px' }}>
                                {/* <td className="px-4 py-2 border-b border-r border-gray-200"><Skeleton width={150} height={20} /></td> */}
                                <td className="border-b py-[13.5px] px-6 text-sm border-r border-gray-200 text-gray-700">
                                    <div className="flex flex-col">
                                        <Skeleton width={120} height={18} />
                                        <Skeleton width={100} height={10} />
                                    </div>
                                </td>
                                <td className="border-b border-gray-200 py-[13.5px] px-6 text-sm border-r text-gray-700">
                                    <div className="flex flex-col">
                                        <Skeleton width={120} height={18} />
                                        <Skeleton width={100} height={10} />
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-r border-gray-200"><Skeleton width={50} height={20} /></td>
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
                totalItems={totalTopics}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                handleItemPerPageChange={handleItemsPerPageChange}
            />

            <EditOrCreateNewModalWrapper
                title={selectedTopic ? "Edit Skill" : "Create Skill"}
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                size="medium"
            >
                <div className="mb-4">
                    <FormInput label="Topic Name" value={name} onChange={(e) => setName(e.target.value)} required={true} placeholder="name" />
                </div>

                <SearchDropdown
                    label="Skill Name"
                    placeholder="Search for a skill..."
                    required={true}
                    fetchResults={fetchAllActiveItems}
                    sectionName={skillName}
                    onSelect={(skill: any) => {
                        setSkillName(skill.name); // Set the selected section
                    }}
                />

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