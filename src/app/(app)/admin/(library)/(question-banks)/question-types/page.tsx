'use client'
import DropdownMenu from '@/components/DropDownMenu';
import { EditOrCreateNewModalWrapper } from '@/components/EditOrCreateNewModalWrapper';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import FormTextarea from '@/components/FormTextarea';
import TableLabelHeader from '@/components/TableLabelHeader';
import { addAllQuestionTypes, fetchQuestionTypes, toggleQuestionTypeStatus, updateQuestionType } from '@/redux/slices/library/question-bank/questionTypeSlice';
import { AppDispatch, RootState } from '@/redux/store';
import React, { useEffect, useRef, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import { useDispatch, useSelector } from 'react-redux';

const QuestionTypesPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const { questionTypes, status, error } = useSelector((state: RootState) => state.questionTypes);
    const [editData, setEditData] = useState(null);
    const ref = useRef<HTMLDivElement>(null);
    const [isModalVisible, setModalVisible] = useState<boolean>(false)
    const [name, setName] = useState<string>("")
    const [shortDescription, setShortDescription] = useState("")
    const [defaultTimeToSolve, setDefaultTimeToSolve] = useState<number>(0)
    const [defaultMarks, setDefaultMark] = useState<number>(0)
    const [isActive, setActive] = useState<boolean>(true)
    const [questionTypeId, setQuestionTypeId] = useState<string>("")

    useEffect(() => {
        dispatch(fetchQuestionTypes({ isActive: null }));
    }, [dispatch]);

    const handleAddAll = () => {
        dispatch(addAllQuestionTypes());
    };

    const handleToggleStatus = (_id: string) => {
        dispatch(toggleQuestionTypeStatus({ _id }));
        setDropdownOpen(null);
    };

    const handleDropdownToggle = (index: any) => {
        setDropdownOpen(dropdownOpen === index ? null : index);
    };

    const handleEdit = (type: any) => {
        setEditData(type);
        setModalVisible(true)
        setQuestionTypeId(type._id)
        setName(type.name)
        setShortDescription(type.shortDescription)
        setDefaultTimeToSolve(type.defaultTimeToSolve)
        setDefaultMark(type.defaultMarks)
        setActive(type.isActive)
        setDropdownOpen(null);
    };

    const handleDelete = (type: string) => {
        console.log("Delete:", type);
        setDropdownOpen(null);
    };

    const handleSave = async (e: any) => {
        e.preventDefault()
        setModalVisible(false);
        const data = { _id: questionTypeId, shortDescription, defaultTimeToSolve, defaultMarks, isActive }
        const response = await dispatch(updateQuestionType(data))
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setDropdownOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    const menuItems = (type: any) => [
        { id: type._id, label: 'Edit', onClick: () => handleEdit(type) },
        // { id: type._id, label: type.isActive ? 'Deactivate' : 'Activate', onClick: () => handleToggleStatus(type._id) },
    ];

    if (error === "Configration is not found") {
        return (
            <div onClick={handleAddAll} className='cursor-pointer w-full h-screen flex items-center justify-center text-red-400'>
                <h1 className='text-2xl'>Configration is not found</h1>
            </div>
        )
    } else
        if (error === "Question types is not found") {
            return (
                <div className='w-full h-screen flex items-center justify-center'>
                    <button
                        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={handleAddAll}
                    >
                        Add All Question Types
                    </button>
                </div>
            )
        }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="container mx-auto">
                <div className="bg-white dark:bg-bg_secondary p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Question Types</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 dark:border-border_secondary">
                            <TableLabelHeader headings={["#", "Name", "Description", "Default Time", "Default Mark", "Status", "Actions"]} />
                            <tbody>
                                {status === 'succeeded' ? (
                                    questionTypes.length > 0 &&
                                    questionTypes.map((type: any, index: number) => (
                                        <tr key={type._id} className={`cursor-default ${(index + 1) % 2 === 0 ? 'bg-gray-100 dark:bg-bg_secondary' : " dark:bg-bg_primary"} h-12`}>
                                            <td className="px-4 py-2 border-t border-b border-r text-sm border-gray-100 dark:border-border_secondary">{index + 1}</td>
                                            <td className="py-2 px-4 text-sm border-t border-b border-r border-gray-100 dark:border-border_secondary">{type.name}</td>
                                            <td className="py-2 px-4 text-sm border-t border-b border-r border-gray-100  dark:border-border_secondary">{type.shortDescription}</td>
                                            <td className="px-4 py-2 border-t border-b text-sm border-r border-gray-100 dark:border-border_secondary">{type.defaultTimeToSolve} sec</td>
                                            <td className="px-4 py-2 border-t border-r border-gray-100 border-b text-sm dark:border-border_secondary">{type.defaultMarks}</td>
                                            <td className="px-4 py-2 border-t border-b border-r border-gray-100 text-sm dark:border-border_secondary">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${type.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {type.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border-t border-b text-sm relative dark:border-border_secondary">
                                                <button
                                                    className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                                    onClick={() => handleDropdownToggle(index)}
                                                >
                                                    <FiMoreVertical />
                                                </button>
                                                <DropdownMenu
                                                    items={menuItems(type)}
                                                    width={20}
                                                    isOpen={dropdownOpen === index}
                                                    onClose={() => setDropdownOpen(null)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <tr key={index} className="h-12">
                                            <td className="px-4 py-2 border-b"><Skeleton width={24} /></td>
                                            <td className="px-4 py-2 border-b"><Skeleton width={150} /></td>
                                            <td className="px-4 py-2 border-b"><Skeleton width={270} height={25} /></td>
                                            <td className="px-4 py-2 border-b"><Skeleton width={40} /></td>
                                            <td className="px-4 py-2 border-b"><Skeleton width={24} /></td>
                                            <td className="px-4 py-2 border-b"><Skeleton width={75} /></td>
                                            <td className="px-4 py-2 border-b"><Skeleton width={24} /></td>
                                        </tr>
                                    ))
                                )}
                                {status === 'failed' && (
                                    <tr>
                                        <span>{error}</span>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <EditOrCreateNewModalWrapper
                title={"Edit Question Type"}
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                size="medium"
            >
                <div className="mb-4">
                    <FormInput disable={true} label="Question Type Name" value={name} onChange={(e) => setName(e.target.value)} required={true} placeholder="name" />
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
                    <FormInput type="number" label="Default Time (In second)" value={defaultTimeToSolve} onChange={(e) => setDefaultTimeToSolve(Number(e.target.value))} required={true} placeholder="Enter Default Time to solve it" />
                </div>
                <div className="mb-4">
                    <FormInput type='number' label="Question Type Name" value={defaultMarks} onChange={(e) => setDefaultMark(Number(e.target.value))} required={true} placeholder="Default Mark" />
                </div>

                <div className="mb-4">
                    <FormSelect
                        label="Status"
                        value={isActive ? "active" : "inactive"}
                        onChange={(e) => setActive(e.target.value === "active")}
                        options={[
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" }
                        ]}
                        className="my-custom-select-class"
                    />
                </div>
            </EditOrCreateNewModalWrapper>
        </div>
    )
}

export default QuestionTypesPage;
