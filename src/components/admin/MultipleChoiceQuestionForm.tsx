import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { createOrUpdateQuestion } from '@/redux/slices/library/question-bank/questionSlice';
import FormErrorMessage from '../FormErrorMessage';
import toast from 'react-hot-toast';
import { MdDeleteOutline } from 'react-icons/md';
import QuestionStepTwo from './QuestionStepTwo';
import QuestionStepThree from './QuestionStepThree';
import QuestionStepFour from './QuestionStepFour';
import axios from 'axios';
// import CustomCKEditor from '../CustomCKEditor';
import dynamic from 'next/dynamic';
const CustomCKEditor = dynamic(() => import("@/components/CustomCKEditor").then((module) => module.default), { ssr: false })


interface MultipleChoiceQuestionFormProps {
    currentStep: number;
    nextStep: () => void;
    prevStep: () => void;
    questionType: 'single' | 'multiple';
    questionId: string;
}

const MultipleChoiceQuestionForm: React.FC<MultipleChoiceQuestionFormProps> = ({
    currentStep,
    nextStep,
    prevStep,
    questionType,
    questionId
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [question, setQuestion] = useState<string>('');
    const [options, setOptions] = useState<{text:string, isCorrect: boolean}[]>([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ]);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [optionErrors, setOptionErrors] = useState<boolean[]>(new Array(options.length).fill(false));
    const [currentQuestionId, setCurrentQuestionId] = useState<string>("");

    useEffect(() => {
        if (questionId) {
            const fetchQuestionDetails = async () => {
                try {
                    const response = await axios.get(`/api/admin/question/get-one/`, {
                        params: { questionId }
                    });
                    setQuestion(response.data.data.question)
                    setOptions(response.data.data.options && response.data.data.options.length > 0
                        ? response.data.data.options
                        : [{ option: '', isCorrect: false }, { option: '', isCorrect: false }]
                    );
                    setCurrentQuestionId(response.data.data?._id || null);
                } catch (error) {
                    console.error('Failed to fetch question data:', error);
                }
            };
            fetchQuestionDetails();
        }
    }, [questionId]);

    // Function to handle option change
    const handleOptionChange = (index: number, value: string) => {
        const updatedOptions = [...options];
        updatedOptions[index].text = value;
        setOptions(updatedOptions);
        setOptionErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = !value;
            return newErrors;
        });
    };

    // Handle setting the correct option
    const handleCorrectOptionChange = (index: number) => {
        if (questionType === 'single') {
            setOptions((prev) =>
                prev.map((opt, i) => ({ ...opt, isCorrect: i === index })) // Only one option can be correct
            );
        } else {
            setOptions((prev) =>
                prev.map((opt, i) => i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt) // Toggle for multiple correct answers
            );
        }
    };

    // Function to add a new option
    const addOption = () => {
        setOptions([...options, { text: '', isCorrect: false }]);
        setOptionErrors((prev) => [...prev, false]);
    };

    // Function to remove an option
    const removeOption = (index: number) => {
        // Use the filter method to create a new array without the removed option
        const updatedOptions = options.filter((_, i) => i !== index);
        setOptions(updatedOptions);
        const updatedOptionErrors = optionErrors.filter((_, i) => i !== index);
        setOptionErrors(updatedOptionErrors);
    };

    const handleSave = async (e: any) => {
        e.preventDefault()
        setFormSubmitted(true)

        const newOptionErrors = options.map(option => !option.text); // Validate all options
        setOptionErrors(newOptionErrors);

        if (newOptionErrors.some(error => error)) {
            return; // Prevent submission if there are errors
        }

        if (options.every(opt => !opt.isCorrect)) {
            toast.error("Please specify at least one correct option");
            return;
        }

        const newQuestion = {
            questionType: questionType === 'single' ? 'Multiple Choice Single Answer' : 'Multiple Choice Multiple Answers',
            question: question,
            options: options,
        }

        console.log(newQuestion);

        const resultAction = await dispatch(createOrUpdateQuestion({ step: 1, data: newQuestion, questionId: currentQuestionId }));
        console.log("resultAction : ", resultAction);

        if (resultAction && createOrUpdateQuestion.fulfilled.match(resultAction)) {
            // If the action was fulfilled, go to the next step
            
            if (!currentQuestionId) {
                setCurrentQuestionId(resultAction?.payload?.questionId);
            }
            nextStep();
        } else {
            // Handle the case where the action was rejected
            console.error("Failed to save question:", resultAction?.payload && resultAction?.payload.message);
            toast.error(resultAction?.payload?.message || 'Failed to save question');
        }
    }

    return (
        <>
            {currentStep === 1 && (
                <div className="space-y-6 flex flex-col items-end w-full md:w-2/3">
                    <div className="w-full">
                        <label className="text-sm font-semibold text-gray-700 dark:text-text_primary">Question</label>
                        <CustomCKEditor content={question} setContent={setQuestion} />
                        {!question && formSubmitted && <FormErrorMessage message="Question is required" />}
                    </div>

                    <div className="mt-6 w-full bg-slate-50 p-6">

                        {options.map((option, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                                <div className="mb-2 text-sm font-semibold text-gray-700">
                                    {`Option ${index + 1}`}
                                </div>

                                <div className={`rounded-md overflow-hidden border-2 ${option.isCorrect ? 'border-green-400' : 'border-green-50'}`}>
                                    <CustomCKEditor
                                        key={`editor-${index}-${option.text}`}
                                        content={option.text}
                                        setContent={(value) => handleOptionChange(index, value)}
                                    />
                                    <div className="flex justify-between items-center px-2 bg-white border border-t-0 border-gray-200">
                                        <div
                                            onClick={() => handleCorrectOptionChange(index)}
                                            className="flex items-center space-x-2 py-1 cursor-pointer"
                                        >
                                            <div
                                                className={`h-4 w-4 rounded border-2 cursor-pointer ${option.isCorrect ? 'bg-green-400 border-green-400' : 'border-gray-300'} flex items-center justify-center`}
                                            >
                                                {option.isCorrect && (
                                                    <svg className="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <label className={`ml-2 text-sm text-gray-700 cursor-pointer ${option.isCorrect ? 'text-green-500' : ''}`}>
                                                {questionType === 'single' ? 'Set as correct answer' : 'Set as correct option'}
                                            </label>
                                        </div>
                                        <span
                                            onClick={() => removeOption(index)}
                                            className='py-1 px-1 rounded-full hover:bg-gray-100 cursor-pointer text-gray-700'
                                        >
                                            <MdDeleteOutline size={22} />
                                        </span>
                                    </div>
                                </div>
                                {optionErrors[index] && formSubmitted && <FormErrorMessage message="Option is required" />}
                            </div>
                        ))}

                        <button
                            onClick={addOption}
                            className="mt-6 w-full py-2 border border-dashed border-gray-600 text-black text-sm rounded-md hover:bg-gray-100 transition duration-200"
                        >
                            Add Option
                        </button>
                    </div>

                    <button
                        onClick={(e) => handleSave(e)}
                        className="mt-4 py-2 px-4 bg-blue_button hover:bg-blue_hover_button text-white rounded-sm font-semibold transition duration-200"
                    >
                        Save & Next
                    </button>
                </div>
            )}

            {currentStep === 2 && (
                <QuestionStepTwo
                    questionId={currentQuestionId}
                    nextStep={nextStep}
                    prevStep={prevStep}
                />
            )}

            {currentStep === 3 && (
                <QuestionStepThree
                    questionId={currentQuestionId}
                    nextStep={nextStep}
                    prevStep={prevStep}
                />
            )}

            {currentStep === 4 && (
                <QuestionStepFour
                    questionId={currentQuestionId}
                    nextStep={nextStep}
                    prevStep={prevStep}
                />
            )}
        </>
    );
}

export default MultipleChoiceQuestionForm;
