'use client'
import { useCallback, useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Skeleton from 'react-loading-skeleton';
import SearchBar from "@/components/SearchBar";
import StatusFilter from "@/components/StatusFilter";
import DropdownMenu from "@/components/DropDownMenu";
import Pagination from "@/components/Pagination";
import TableLabelHeader from "@/components/TableLabelHeader";
import SearchFilters from "@/components/SearchFilters";
import { deleteQuestion, fetchQuestions } from "@/redux/slices/library/question-bank/questionSlice";
import toast from "react-hot-toast";
import QuestionTypesDropdownSelector from "@/components/QuestionTypesDropdownSelector";
import { useRouter } from "next/navigation";
import { BsDash } from "react-icons/bs";
import { QuestionViewModal } from "@/components/QuesitonViewModal";
import KtIcon from "@/components/KtIcon";
import CopyButton from "@/components/CopyButton";
import ImportModal from "@/components/ImportModal";

type SearchQuery = {
    questionCode: string;
    question: string;
    questionType: string;
    section: string;
    skill: string;
    topic: string;
    isActive: boolean | null;
};

export default function Page() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter()
    const { totalPages = 1, totalQuestions } = useSelector((state: RootState) => state.question);
    const [loadingPage, setLoadingPage] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [pagesCache, setPagesCache] = useState<Record<number, any[]>>({}); // Cache to store page data
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [isShowViewModal, setIsShowViewModal] = useState<boolean>(false)
    const [selectedQuestionId, setSelectedQuestionId] = useState<string>('')
    const [selectAll, setSelectAll] = useState<boolean>(false);

    const [filterQuery, setFilterQuery] = useState<SearchQuery>({
        questionCode: "",
        question: "",
        questionType: "",
        section: "",
        skill: "",
        topic: "",
        isActive: null,
    });

    const [searchQuery, setSearchQuery] = useState<SearchQuery>({
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
                // console.log("response ::: ", response);

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
        setDropdownOpen(null);
        const response = await dispatch(deleteQuestion(questionId));
        if (response?.payload) {
            // Remove the deleted section from the list of sections
            const updatedQuestions = questions.filter(que => que._id !== questionId);
            toast.success("Question delete Successfully")
            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedQuestions
            }));
        }
    };

    const handleView = async (questionId: string) => {
        // Fetch the question details and open modal (handled in component state)
        setIsShowViewModal(true)
        setSelectedQuestionId(questionId)
        setDropdownOpen(null)

    };

    const onClose = () => {
        setIsShowViewModal(false)
    }

    const menuItems = (item: any) => [
        // { id: item._id, label: item.isActive ? 'Deactivate' : 'Activate', onClick: () => onEdit(item) },
        { id: item._id, label: 'View', onClick: () => handleView(item._id) }, // View button
        { id: item._id, label: 'Edit', onClick: () => router.push(`/admin/question/edit/${item._id}`) },
        { id: item._id, label: 'Delete', onClick: () => handleDelete(item._id) },
    ];

    const handleSelectQuestion = (questionId: string) => {
        setSelectedQuestions((prevSelected) =>
            prevSelected.includes(questionId)
                ? prevSelected.filter(id => id !== questionId)
                : [...prevSelected, questionId]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedQuestions([])
        } else {
            const currentQuestionIds = questions.map(q => q._id)
            setSelectedQuestions(currentQuestionIds);
        }
        setSelectAll(!selectAll)

    }

    const handleDeleteSelected = async () => {
        try {
            const response = await Promise.all(selectedQuestions.map(id => dispatch(deleteQuestion(id))));
            if (response && response.length > 0) {
                toast.success(`${selectedQuestions.length} questions deleted`);
                setSelectedQuestions([]);
                setSelectAll(false)
                const updatedQuestions = questions.filter(q => !selectedQuestions.includes(q._id));
                setPagesCache(prevCache => ({
                    ...prevCache,
                    [currentPage]: updatedQuestions,
                }));
            }
        } catch (error) {
            toast.error("Failed to delete selected questions");
        }
    };

    const filterFields = [
        <span key=""></span>,
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
        <div className="container mx-auto p-3 dark:bg-bg_secondary bg-white shadow-md">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-600 dark:text-text_secondary">Manage Questions</h2>
                <div className="flex gap-3">
                    {selectedQuestions.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium ">{selectedQuestions.length} selected</span>
                            <button
                                onClick={handleDeleteSelected}
                                className="flex gap-1 items-center bg-[#F8285A] hover:bg-red-600 text-white text-xs px-3 py-2 rounded-md"
                            >
                                <KtIcon size={20} className="" filePath="/media/icons/duotune/general/gen027.svg" />
                                <span>Delete Selected</span>
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => router.push(`/admin/import-questions`)}
                        className="bg-[#E9F3FF] dark:bg-gray-800 text-blue-500 dark:text-blue-400 font-semibold hover:text-white dark:hover:text-gray-100 flex items-center gap-1 px-3 py-2 hover:bg-blue_hover_button dark:hover:bg-blue-600 transition duration-200 ease-in-out rounded-md"
                    >
                        <KtIcon size={20} className="" filePath="/media/icons/duotune/arrows/arr078.svg" />
                        <span className="text-xs">Import</span>
                    </button>

                    <button
                        onClick={() => router.push(`/admin/question/new`)}
                        className="bg-blue_button dark:bg-blue-600 text-white flex items-center gap-1 px-3 py-2 hover:bg-blue_hover_button transition duration-200 ease-in-out rounded-md"
                    >
                        <KtIcon size={20} className="text-white" filePath="/media/icons/duotune/arrows/arr075.svg" />
                        <span className='text-xs'>Add Question</span>
                    </button>
                </div>
            </div>

            {/* Question Table */}
            <table className="min-w-full border dark:border-[#2d2d2d] dark:text-text_secondary dark:bg-bg_secondary ">
                <TableLabelHeader headings={
                    [
                        <div
                            key="selectAll"
                            className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-colors duration-300 ${selectAll ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'} `}
                            onClick={handleSelectAll}
                        >
                            {
                                selectAll ?
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    : ""
                            }
                        </div>,
                        "Code",
                        "Question",
                        "Type",
                        "Section",
                        "Skill",
                        "Topic",
                        "Status",
                        "Actions"
                    ]
                } />
                {/* Search Filters */}
                <SearchFilters filterFields={filterFields} onSearch={handleSearch} />
                <tbody>
                    {!loadingPage ? (
                        questions.length > 0 ? (
                            questions.map((item: any) => (
                                <tr key={item.id} className="border-gray-100 border-t hover:bg-gray-50 dark:border-border_secondary dark:hover:bg-hover_secondary" >
                                    <td className="py-3 px-3 text-sm border-gray-100 dark:border-border_secondary">
                                        <div
                                            className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-colors duration-300 ${selectedQuestions.includes(item._id) ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                                                }`}
                                            onClick={() => handleSelectQuestion(item._id)}
                                        >
                                            {selectedQuestions.includes(item._id) && (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </td>

                                    <td className="py-3 px-3 text-sm  border-gray-100 flex items-center dark:border-border_secondary">
                                        <CopyButton text={item?.questionCode} />
                                    </td>
                                    <td className="py-3 px-3 text-sm  border-gray-100 dark:border-border_secondary">
                                        {/* Render HTML content from the question field */}
                                        <div
                                            dangerouslySetInnerHTML={{ __html: item?.question }}
                                        />
                                    </td>
                                    <td className="py-3 px-3 text-sm  border-gray-100 dark:border-border_secondary">
                                        {
                                            item?.questionType === 'MSA'
                                                ? "Multiple Choice Single Answer"
                                                : item?.questionType === 'MMA'
                                                    ? 'Multiple Choice Multiple Answers'
                                                    : item?.questionType === 'TOF'
                                                        ? 'True or False'
                                                        : item?.questionType === 'SAQ'
                                                            ? 'Short Answer'
                                                            : item?.questionType === 'MTF'
                                                                ? 'Match the Following'
                                                                : item?.questionType === 'MTF'
                                                                    ? 'Match the Following'
                                                                    : item?.questionType === 'ORD'
                                                                        ? 'Ordering/Sequence'
                                                                        : item?.questionType === 'FIB'
                                                                            ? 'Fill in the Blanks' :
                                                                            ""
                                        }
                                    </td>
                                    <td className="py-3 px-3 text-sm border-gray-100 dark:border-border_secondary">
                                        {item?.section ? item?.section : <BsDash />}
                                    </td>
                                    <td className="py-3 px-3 text-sm  border-gray-100 dark:border-border_secondary">
                                        {item?.skill ? item?.skill : <BsDash />}
                                    </td>
                                    <td className="py-3 px-3 text-sm  border-gray-100 dark:border-border_secondary">
                                        {item?.topic ? item?.topic : <BsDash />}
                                    </td>
                                    <td className="py-3 px-3 text-sm  border-gray-100 dark:border-border_secondary" >
                                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${item.isActive ? "bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300"}`}>
                                            {item.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-sm relative w-fit">
                                        <button
                                            className=" hover:text-gray-800 focus:outline-none"
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
                                    <td colSpan={2} className="text-center py-4 text-gray-500">No questions found</td>
                                </tr>
                            )
                    ) : (
                        Array.from({ length: itemsPerPage }).map((_, index) => (
                            <tr key={index} style={{ height: '45px' }}>
                                <td className="px-3 py-2 border-b border-r border-gray-200 dark:border-border_secondary"><Skeleton width={20} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200 dark:border-border_secondary"><Skeleton width={140} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200 dark:border-border_secondary"><Skeleton width={150} height={30} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200 dark:border-border_secondary"><Skeleton width={80} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200 dark:border-border_secondary"><Skeleton width={80} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200 dark:border-border_secondary"><Skeleton width={80} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200 dark:border-border_secondary"><Skeleton width={80} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200 dark:border-border_secondary"><Skeleton width={70} height={20} /></td>
                                <td className="px-3 py-2 border-b border-r border-gray-200 dark:border-border_secondary"><Skeleton width={10} height={20} /></td>
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
            <QuestionViewModal onClose={onClose} size="very_large" isVisible={isShowViewModal} questionId={selectedQuestionId} title="Question Details" />
        </div>
    );
}