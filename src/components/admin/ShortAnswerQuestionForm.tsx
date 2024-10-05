import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { createOrUpdateQuestion } from '@/redux/slices/library/question-bank/questionSlice';
import FormErrorMessage from '../FormErrorMessage';
import toast from 'react-hot-toast';
import axios from 'axios';
import { MdDeleteOutline } from 'react-icons/md';
import QuestionStepTwo from './QuestionStepTwo';
import QuestionStepThree from './QuestionStepThree';
import QuestionStepFour from './QuestionStepFour';
import dynamic from 'next/dynamic';
// import CustomCKEditor from '../CustomCKEditor';
const CustomCKEditor = dynamic(() => import("@/components/CustomCKEditor").then((module) => module.default), { ssr: false })


interface ShortAnswerQuestionFormProps {
    currentStep: number;
    nextStep: () => void;
    prevStep: () => void;
    questionId: string;
}

const ShortAnswerQuestionForm: React.FC<ShortAnswerQuestionFormProps> = ({
    currentStep,
    nextStep,
    prevStep,
    questionId
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [question, setQuestion] = useState<string>('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [shortAnswer, setShortAnswer] = useState<number | null>(null); // Single correct option
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [currentQuestionId, setCurrentQuestionId] = useState<string>("");
    const [optionErrors, setOptionErrors] = useState<boolean[]>(new Array(options.length).fill(false));

    useEffect(() => {
        if (questionId) {
            const fetchQuestionDetails = async () => {
                try {
                    const response = await axios.get(`/api/admin/question/get-one/`, {
                        params: { questionId }
                    });
                    console.log(response.data.data);
                    
                    setQuestion(response.data.data?.question);
                    setShortAnswer(Number(response.data.data?.shortAnswer));
                    setOptions(response.data.data?.options || ['', '']);
                    setCurrentQuestionId(response.data.data?._id || null);
                } catch (error) {
                    console.error('Failed to fetch question data:', error);
                }
            };
            fetchQuestionDetails();
        }
    }, [questionId]);

    const handleOptionChange = (index: number, value: string) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
        setOptionErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = !value;
            return newErrors;
        })
    };

    const handleCorrectOptionChange = (index: number) => {
        setShortAnswer(index); // Set the single correct option
    };

    const addOption = () => {
        setOptions([...options, '']);
        setOptionErrors((prev) => [...prev, false]);
    };

    const removeOption = (index: number) => {
        const updatedOptions = options.filter((_, i) => i !== index);
        setOptions(updatedOptions);
        setOptionErrors((prev) => prev.filter((_, i) => i !== index)); // Remove corresponding error state

        // If the correct option was removed, reset the shortAnswer state
        if (shortAnswer === index) {
            setShortAnswer(null);
        } else if (shortAnswer !== null && shortAnswer > index) {
            setShortAnswer(shortAnswer - 1); // Adjust the correct option index
        }
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        setFormSubmitted(true);

        if (!question) {
            toast.error('Question is required');
            return;
        }
        if (shortAnswer === null) {
            toast.error('A correct answer is required');
            return;
        }

        const newQuestion = {
            questionType: 'Short Answer',
            question,
            options,
            shortAnswer,
        };

        const resultAction = await dispatch(createOrUpdateQuestion({ step: 1, data: newQuestion, questionId: currentQuestionId }));

        if (resultAction && createOrUpdateQuestion.fulfilled.match(resultAction)) {
            if (!currentQuestionId) {
                setCurrentQuestionId(resultAction.payload.questionId);
            }
            nextStep();
        } else {
            console.error("Failed to save question:", resultAction?.payload?.message);
            toast.error(resultAction?.payload?.message || 'Failed to save question');
        }
    };

    return (
        <>
            {currentStep === 1 && (
                <div className="space-y-6 flex flex-col items-end w-full md:w-2/3">
                    {/* Question */}
                    <div className="w-full">
                        <label className="text-sm font-semibold text-gray-700">Question</label>
                        <CustomCKEditor content={question} setContent={setQuestion} />
                        {
                            !question && formSubmitted &&
                            <FormErrorMessage message="Question is required" />
                        }
                    </div>

                    {/* Options */}
                    <div className="mt-6 w-full bg-slate-50 p-6">
                        {options.map((option, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                                {/* Option Label */}
                                <div className="mb-2 text-sm font-semibold text-gray-700">
                                    {`Option ${index + 1}`}
                                </div>

                                {/* Input Field for Option */}
                                <div className={`overflow-hidden border ${shortAnswer === index ? 'border-green-400' : 'border-slate-50'}`}>
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="w-full outline-0 focus:outline-0 border border-gray-200 focus:border-gray-400 hover:border-gray-400 px-3 py-2 "
                                    />
                                    {/* Correct Option and Remove Button */}
                                    <div className="flex justify-between items-center px-2 bg-white border border-t-0 border-gray-200">
                                        {/* Correct Option Radio Button */}
                                        <div
                                            onClick={() => handleCorrectOptionChange(index)}
                                            className="flex items-center space-x-2 py-1 cursor-pointer "
                                        >
                                            <div
                                                className={`h-4 w-4 rounded-full border-2 cursor-pointer ${shortAnswer === index ? 'bg-green-400 border-green-400' : 'border-gray-300'} flex items-center justify-center`}
                                            >
                                                {shortAnswer === index && (
                                                    <svg className="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <label className={`ml-2 text-sm text-gray-700 cursor-pointer ${shortAnswer === index ? 'text-green-500' : ''}`}>
                                                Set as correct answer
                                            </label>
                                        </div>

                                        {/* Remove Option Button */}
                                        {options.length > 2 && (
                                            <span
                                                onClick={() => removeOption(index)}
                                                className='py-1 px-1 rounded-full hover:bg-gray-100 cursor-pointer text-gray-700'
                                            >
                                                <MdDeleteOutline size={22} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {!option && formSubmitted && <FormErrorMessage message="Option is required" />}
                            </div>
                        ))}

                        {/* Add New Option Button */}
                        <button
                            onClick={addOption}
                            className="mt-6 w-full py-2 border border-dashed border-gray-600 text-black text-sm rounded-md hover:bg-gray-100 transition duration-200"
                        >
                            Add Option
                        </button>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={(e) => handleSave(e)}
                        className="mt-4 py-2 px-4 bg-[#3699FF] text-white rounded-sm font-semibold hover:bg-[#3699FF] transition duration-200"
                    >
                        Save Question
                    </button>
                </div>
            )}

            {/* Step 2: Additional Question Details */}
            {currentStep === 2 && (
                <QuestionStepTwo
                    questionId={currentQuestionId}
                    nextStep={nextStep}
                    prevStep={prevStep}
                />
            )}

            {/* Step 3: Solution */}
            {currentStep === 3 && (
                <QuestionStepThree
                    questionId={currentQuestionId}
                    nextStep={nextStep}
                    prevStep={prevStep}
                />
            )}

            {/* Step 4: Attachment */}
            {currentStep === 4 && (
                <QuestionStepFour
                    questionId={currentQuestionId}
                    nextStep={nextStep}
                    prevStep={prevStep}
                />
            )}
        </>
    );
};

export default ShortAnswerQuestionForm;
