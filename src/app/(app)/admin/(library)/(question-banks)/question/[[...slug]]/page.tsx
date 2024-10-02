'use client';
import MultipleChoiceQuestionForm from '@/components/admin/MultipleChoiceQuestionForm';
import StepIndicator from '@/components/StepIndicator';
import { fetchQuestions } from '@/redux/slices/library/question-bank/questionSlice';
import { fetchQuestionTypes } from '@/redux/slices/library/question-bank/questionTypeSlice';
import { AppDispatch, RootState } from '@/redux/store';
import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdRadioButtonChecked, MdCheckBox, MdTextFields, MdListAlt } from 'react-icons/md';
import { FaSortNumericDown, FaPenAlt } from 'react-icons/fa';
import { FiCheckSquare } from 'react-icons/fi';
import TrueFalseQuestionForm from '@/components/admin/TrueFalseQuestionForm';

interface IQuestionType {
    name?: string;
    shortDescription?: string;
    code?: string;
    _id?: string;
    isActive: boolean;
    defaultTimeToSolve: number;
    defaultMarks: number;
}
const steps = [
    { label: 'Step 1', description: 'Add Question' },
    { label: 'Step 2', description: 'Settings' },
    { label: 'Step 3', description: 'Solution' },
    { label: 'Step 4', description: 'Attachment' },
];

function CreateOrEditPage({ params }: any) {
    const { slug } = params;
    const isEdit = slug[0] === 'edit'; // Check if the first part of the slug is "edit"
    const questionId = isEdit ? slug[1] : null; // Extract the questionId if editing
    // console.log(slug);

    const { questionTypes, status, error } = useSelector((state: RootState) => state.questionTypes);
    const dispatch = useDispatch<AppDispatch>();

    const [selectedTab, setSelectedTab] = useState<any | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [questionData, setQuestionData] = useState(null);

    useEffect(() => {
        if (!isEdit) {
            dispatch(fetchQuestionTypes({ isActive: true }));
        }
    }, [dispatch]);

    useEffect(() => {
        if (questionTypes.length > 0 && !selectedTab) {
            setSelectedTab(questionTypes[0]);
        }
    }, [questionTypes, selectedTab]);

    // Fetch question data if we are in edit mode
    useEffect(() => {
        if (isEdit && questionId) {
            const fetchQuestionDetails = async () => {
                try {
                    const response = await axios.get(`/api/admin/question/get-one/`, {
                        params: { questionId }
                    });
                    console.log("response : ", response);

                    setQuestionData(response.data.data); // Set the fetched question data
                    setSelectedTab(response.data.data.questionType)
                } catch (error) {
                    console.error('Failed to fetch question data:', error);
                }
            };

            fetchQuestionDetails();
        }
    }, [isEdit, questionId]);

    const handleNextStep = useCallback(() => setCurrentStep((prev) => prev + 1), []);

    const handlePrevStep = useCallback(() => setCurrentStep((prev) => Math.max(1, prev - 1)), []);

    const renderQuestionForm = useCallback(() => {
        if (!selectedTab) return <div>Select a valid question type</div>;
        if (typeof selectedTab === "string") {
            switch (selectedTab) {
                case 'Multiple Choice Single Answer':
                    return (
                        <MultipleChoiceQuestionForm
                            currentStep={currentStep}
                            nextStep={handleNextStep}
                            prevStep={handlePrevStep}
                            questionData={questionData}
                            questionType='single'
                        />
                    );
                case 'MMA':
                    return <MultipleChoiceQuestionForm
                        currentStep={currentStep}
                        nextStep={handleNextStep}
                        prevStep={handlePrevStep}
                        questionType='multiple'
                    />
                case 'TOF':
                    return <div>True or False Form</div>;
                case 'SAQ':
                    return <div>Short Answer Form</div>;
                case 'MTF':
                    return <div>Match the Following Form</div>;
                case 'ORD':
                    return <div>Ordering/Sequence Form</div>;
                case 'fill-in-the-blanks':
                    return <div>Fill in the Blanks Form</div>;
                default:
                    return <div>Select a valid question type</div>;
            }

        } else if (typeof selectedTab === 'object') {
            switch (selectedTab?.code) {
                case 'MSA':
                    return (
                        <MultipleChoiceQuestionForm
                            currentStep={currentStep}
                            nextStep={handleNextStep}
                            prevStep={handlePrevStep}
                            questionType='single'
                        />
                    );
                case 'MMA':
                    return <MultipleChoiceQuestionForm
                        currentStep={currentStep}
                        nextStep={handleNextStep}
                        prevStep={handlePrevStep}
                        questionType='multiple'
                    />
                case 'TOF':
                    return <TrueFalseQuestionForm
                        currentStep={currentStep}
                        nextStep={handleNextStep}
                        prevStep={handlePrevStep}
                    />
                case 'SAQ':
                    return <div>Short Answer Form</div>;
                case 'MTF':
                    return <div>Match the Following Form</div>;
                case 'ORD':
                    return <div>Ordering/Sequence Form</div>;
                case 'fill-in-the-blanks':
                    return <div>Fill in the Blanks Form</div>;
                default:
                    return <div>Select a valid question type</div>;
            }
        }
    }, [selectedTab, currentStep, handleNextStep, handlePrevStep, isEdit, questionData]);

    return (
        <div className="w-full mx-auto p-3 rounded-md">
            <div className='flex justify-between items-center gap-6 py-4 px-6 w-full border rounded-xl shadow-lg bg-white mb-6 border-gray-200'>
                {/* Left Section: Title and Tab */}
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                    {isEdit ? `Edit Question` : 'Add Question to Question Bank'}
                </h1>

                {/* Right Section: Step Indicator */}
                <StepIndicator
                    steps={steps}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    isEdit={isEdit}
                />
            </div>

            <div className='p-6 bg-white rounded-b-md'>
                {
                    !isEdit && currentStep === 1 &&
                    <div>
                        <Heading num="1" text="Select Question Type" />
                        <div className="flex gap-2 items-center justify-center">
                            {questionTypes.map((type) => (
                                <div key={type.code} onClick={() => setSelectedTab(type)}
                                    className={`w-32 h-32 p-3 flex flex-col justify-center items-center border rounded-lg cursor-pointer transition-transform duration-300 ${selectedTab === type ? 'border-gray-600 scale-105 shadow-sm' : 'border-gray-300 bg-gray-50'
                                        }`}>
                                    <div className="mb-2 text-gray-700">
                                        {
                                            (() => {
                                                switch (type.code) {
                                                    case "MSA":
                                                        return <MdRadioButtonChecked size={22} />;
                                                    case "MMA":
                                                        return <MdCheckBox size={22} />;
                                                    case "TOF":
                                                        return <FiCheckSquare size={22} />;
                                                    case "SAQ":
                                                        return <MdTextFields size={22} />;
                                                    case "MTF":
                                                        return <MdListAlt size={22} />;
                                                    case "ORD":
                                                        return <FaSortNumericDown size={22} />;
                                                    case "FIB":
                                                        return <FaPenAlt size={22} />;
                                                    default:
                                                        return null;
                                                }
                                            })()
                                        }
                                    </div>
                                    <button className="text-center text-gray-700 font-medium text-xs">
                                        {type.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                }
                <div className="mt-6">
                    <Heading num="2" text="Create Question" />
                </div>
                <div className="">{renderQuestionForm()}</div>
            </div>
        </div>
    );
}

const Heading = ({ num, text }: any) => {
    return (
        <div className='flex gap-4 mb-6'>
            <span className='bg-black text-white rounded-full w-6 h-6 text-center'>{num}</span>
            <div className='relative w-full h-12'>
                <h2 className='font-medium text-md'>{text}</h2>
                <span className='w-full border border-gray-100 absolute bottom-0'></span>
            </div>
        </div>
    )
}

export default CreateOrEditPage;