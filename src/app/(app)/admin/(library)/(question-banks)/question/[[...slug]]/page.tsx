'use client';
import MultipleChoiceQuestionForm from '@/components/admin/MultipleChoiceQuestionForm';
import StepIndicator from '@/components/StepIndicator';
import { fetchQuestions } from '@/redux/slices/library/question-bank/questionSlice';
import { fetchQuestionTypes } from '@/redux/slices/library/question-bank/questionTypeSlice';
import { AppDispatch, RootState } from '@/redux/store';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
    console.log(slug);

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
                        />
                    );
                case 'MMA':
                    return <div>Multiple Choice Multiple Answers Form</div>;
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
                        />
                    );
                case 'MMA':
                    return <div>Multiple Choice Multiple Answers Form</div>;
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
        }
    }, [selectedTab, currentStep, handleNextStep, handlePrevStep, isEdit, questionData]);

    return (
        <div className="w-full mx-auto p-3 rounded-md">
            <div className='flex justify-between items-center gap-6 py-3 px-4 w-full bg-white mb-4 rounded-md shadow-sm'>
                <div className='flex flex-col'>
                    <h1 className="text-xl font-bold text-gray-800">
                        {isEdit ? `Edit Question` : 'Add Question to Question Bank'}
                    </h1>
                    <span>{selectedTab ? selectedTab.name : 'No Tab Selected'}</span>
                </div>
                <StepIndicator steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} isEdit={isEdit}  />
            </div>
            {
                !isEdit &&
                <div className="flex">
                    {questionTypes.map((item: any) => (
                        <button
                            key={item.code}
                            onClick={() => setSelectedTab(item)}
                            className={`py-2 px-3 text-sm border-b font-semibold transition-all duration-200 ${selectedTab?.code === item.code
                                ? 'bg-white text-gray-900 border-b-0'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
                                } rounded-t-md`}
                            disabled={!item.name} // Disable if name is undefined
                        >
                            {item.name || 'Unnamed Question Type'}
                        </button>
                    ))}
                </div>
            }
            <div className="p-6 bg-white rounded-b-md">{renderQuestionForm()}</div>
        </div>
    );
}

export default CreateOrEditPage;