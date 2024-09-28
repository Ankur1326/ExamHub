'use client'
import { useCallback, useEffect, useState } from "react";
import { FiCopy, FiMoreVertical } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Skeleton from 'react-loading-skeleton';
import SectionHeader from "@/components/SectionHeader";
import SearchBar from "@/components/SearchBar";
import StatusFilter from "@/components/StatusFilter";
import DropdownMenu from "@/components/DropDownMenu";
import Pagination from "@/components/Pagination";
import TableLabelHeader from "@/components/TableLabelHeader";
import SearchFilters from "@/components/SearchFilters";
import { formatDate } from "@/utility/dateFormate";
import { fetchQuestions } from "@/redux/slices/library/question-bank/questionSlice";
import toast from "react-hot-toast";
import QuestionTypesDropdownSelector from "@/components/QuestionTypesDropdownSelector";
import { useRouter } from "next/navigation";
import { BsDash } from "react-icons/bs";

export default function Page() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter()
    const { totalPages = 1, totalQuestions } = useSelector((state: RootState) => state.question);
    const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
    const [loadingPage, setLoadingPage] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [pagesCache, setPagesCache] = useState<Record<number, any[]>>({}); // Cache to store page data
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

    const [filterQuery, setFilterQuery] = useState<any>({
        questionCode: "",
        question: "",
        questionType: "",
        section: "",
        skill: "",
        topic: "",
        isActive: null,
    });

    const [searchQuery, setSearchQuery] = useState({
        questionCode: "",
        question: "",
        questionType: "",
        section: "",
        skill: "",
        topic: "",
        isActive: null,
    });

    const questions = pagesCache[currentPage] || []; // Get sections for the current page from cache

    useEffect(() => {
        const fetchData = async () => {
            if (!pagesCache[currentPage]) {
                setLoadingPage(true);
                const response: any = await dispatch(fetchQuestions({ ...searchQuery, currentPage, itemsPerPage }));
                if (typeof response.payload !== 'string' && response.payload?.questions) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage]: response?.payload?.questions,
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
                const nextPageResponse: any = await dispatch(fetchQuestions({ currentPage: currentPage + 1, itemsPerPage }));

                if (typeof nextPageResponse.payload !== 'string' && nextPageResponse.payload?.questions) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage + 1]: nextPageResponse?.payload?.questions,
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
        setItemsPerPage(totalQuestions);
        setPagesCache({});
        setCurrentPage(1);
    }, [filterQuery, totalQuestions]);

    const handleItemsPerPageChange = (e: any) => {
        setPagesCache({})
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    }

    const handleDelete = async (questionId: string) => {
        // setDropdownOpen(null);
        // const response = await dispatch(deleteQu(sectionId));
        // if (response?.payload) {
        //     // Remove the deleted section from the list of sections
        //     const updatedSections = sections.filter(section => section._id !== sectionId);

        //     setPagesCache(prevCache => ({
        //         ...prevCache,
        //         [currentPage]: updatedSections
        //     }));
        // }
        toast.success("Not developed")
    };

    const menuItems = (questionId: string) => [
        // { id: item._id, label: item.isActive ? 'Deactivate' : 'Activate', onClick: () => onEdit(item) },
        { id: questionId, label: 'Edit', onClick: () => router.push(`/admin/question/edit/${questionId}`) },
        { id: questionId, label: 'Delete', onClick: () => handleDelete(questionId) }
    ];

    const filterFields = [
        <SearchBar
            key="code"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="Code..."
            fieldName="questionCode" // Pass the key corresponding to the filter
            width={160}
        />,
        <SearchBar
            key="question"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="Question..."
            fieldName="question" // Pass the key corresponding to the filter
            width={170}
        />,
        <QuestionTypesDropdownSelector
            key="Type"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            width={130}
        />,
        <SearchBar
            key="section"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="Section..."
            fieldName="section" // Pass the key corresponding to the filter
            width={130}
        />,
        <SearchBar
            key="skill"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="Skill..."
            fieldName="skill" // Pass the key corresponding to the filter
            width={130}
        />,
        <SearchBar
            key="topic"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            placeHolder="Topic..."
            fieldName="topic" // Pass the key corresponding to the filter
            width={130}
        />,
        <StatusFilter
            key="status"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
        />,
        // <></>,
    ];

    return (
        <div className="container mx-auto p-3">
            {/* Header Section */}
            <SectionHeader title="Manage Questions" onClick={() => router.push(`/admin/question/new`)} />
            {/* Question Table */}

            <table className="min-w-full bg-white shadow-md rounded-sm">
                <TableLabelHeader headings={["Code", "Question", "Type", "Section", "Skill", "Topic", "Status", "Actions"]} />
                {/* Search Filters */}
                <SearchFilters filterFields={filterFields} onSearch={handleSearch} />
                <tbody>
                    {!loadingPage ? (
                        questions.length > 0 ? (
                            questions.map((item: any) => (
                                <tr key={item.id} className="border-t border-r border-gray-100 hover:bg-gray-50" >
                                    <td className="py-3 px-3 text-sm border-r border-gray-100 flex items-center">
                                        <button
                                            className="bg-[#3699FF] hover:bg-[#3291F0] text-white px-2 py-1 text-xs rounded flex items-center focus:outline-none"
                                            onClick={() => navigator.clipboard.writeText(item?.questionCode)}
                                        >
                                            <FiCopy className="mr-1" /> {item?.questionCode}
                                        </button>
                                    </td>
                                    <td className="py-3 px-3 text-sm border-r border-gray-100">
                                        {/* Render HTML content from the question field */}
                                        <div
                                            dangerouslySetInnerHTML={{ __html: item?.question }}
                                        />
                                    </td>
                                    <td className="py-3 px-3 text-sm border-r border-gray-100">
                                        {item?.questionType}
                                    </td>
                                    <td className="py-3 px-3 text-sm border-r border-gray-100">
                                        {item?.section ? item?.section : <BsDash />}
                                    </td>
                                    <td className="py-3 px-3 text-sm border-r border-gray-100">
                                        {item?.skill ? item?.skill : <BsDash />}
                                    </td>
                                    <td className="py-3 px-3 text-sm border-r border-gray-100">
                                        {item?.topic ? item?.topic : <BsDash />}
                                    </td>
                                    <td className="py-3 px-3 text-sm border-r border-gray-100">
                                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${item.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>
                                            {item.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-sm relative w-fit">
                                        <button
                                            className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                            onClick={() => setDropdownOpen(dropdownOpen === item._id ? null : item._id)}
                                        >
                                            <FiMoreVertical />
                                        </button>
                                        <DropdownMenu
                                            items={menuItems(item._id)}
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
                                    <td colSpan={2} className="text-center py-4 text-gray-500">No questions found</td>
                                </tr>
                            )
                    ) : (
                        Array.from({ length: itemsPerPage }).map((_, index) => (
                            <tr key={index} style={{ height: '45px' }}>
                                <td className="px-3 py-2 border-b border-r border-gray-200"><Skeleton width={140} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200"><Skeleton width={150} height={30} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200"><Skeleton width={80} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200"><Skeleton width={80} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200"><Skeleton width={80} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200"><Skeleton width={80} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200"><Skeleton width={70} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200"><Skeleton width={10} height={20} /></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalQuestions}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                handleItemPerPageChange={handleItemsPerPageChange}
            />
        </div>
    );
}