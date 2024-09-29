import React, { useEffect, useState } from 'react';
import CustomCKEditor from '../CustomCKEditor';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { createOrUpdateQuestion } from '@/redux/slices/library/question-bank/questionSlice';
import FormErrorMessage from '../FormErrorMessage';
import toast from 'react-hot-toast';
import { MdDeleteOutline } from 'react-icons/md';
import QuestionStepTwo from './QuestionStepTwo';
import QuestionStepThree from './QuestionStepThree';
import QuestionStepFour from './QuestionStepFour';

interface MultipleChoiceQuestionFormProps {
    currentStep: number;
    nextStep: () => void;
    prevStep: () => void;
    questionData?: any;
}

const MultipleChoiceQuestionForm: React.FC<MultipleChoiceQuestionFormProps> = ({
    currentStep,
    nextStep,
    prevStep,
    questionData
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [question, setQuestion] = useState<string>('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [correctOption, setCorrectOption] = useState<number | null>(null);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [optionErrors, setOptionErrors] = useState<boolean[]>(new Array(options.length).fill(false));
    const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);

    useEffect(() => {
        if (questionData) {
            setQuestion(questionData?.question || '');
            setOptions(
                questionData.options && questionData.options.length > 0
                    ? questionData.options
                    : ['', '']
            );
            setCorrectOption(questionData ? questionData.correctOptions[0] + 1 : null);
            setCurrentQuestionId(questionData?._id || null);
        }
    }, [questionData]);

    // Function to handle option change
    const handleOptionChange = (index: number, value: string) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
        setOptionErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = !value; // Update error state based on current value
            return newErrors;
        });
    };

    // Function to add a new option
    const addOption = () => {
        setOptions([...options, '']);
        setOptionErrors((prev) => [...prev, false]); // Add a corresponding error state
    };

    // Function to remove an option
    const removeOption = (index: number) => {
        const updatedOptions = options.filter((_, i) => i !== index);
        setOptions(updatedOptions);
        setOptionErrors((prev) => prev.filter((_, i) => i !== index)); // Remove corresponding error state
        if (index + 1 === correctOption) setCorrectOption(null); // Reset correct option if it's deleted
    };

    // Handle setting the correct option
    const handleCorrectOptionChange = (index: number) => {
        setCorrectOption(index + 1);
    };

    const handleSave = async (e: any) => {
        e.preventDefault()
        setFormSubmitted(true)

        const newOptionErrors = options.map(option => !option); // Validate all options
        setOptionErrors(newOptionErrors);

        if (newOptionErrors.some(error => error)) {
            return; // Prevent submission if there are errors
        }
        if (!correctOption) {
            toast.error("Please specify correct answer")
            return;
        }

        const newQuestion = {
            questionType: 'Multiple Choice Single Answer', // Multiple Choice Single Answer
            question: question,
            options: options,
            correctOptions: [correctOption - 1] // index wise
        }

        // console.log(newQuestion);

        const resultAction = await dispatch(createOrUpdateQuestion({ step: 1, data: newQuestion, questionId: currentQuestionId }));

        if (resultAction && createOrUpdateQuestion.fulfilled.match(resultAction)) {
            // If the action was fulfilled, go to the next step
            if (!currentQuestionId) {
                setCurrentQuestionId(resultAction.payload.questionId);
            }
            nextStep();
        } else {
            // Handle the case where the action was rejected
            console.error("Failed to save question:", resultAction?.payload && resultAction?.payload.message);
            toast.error(resultAction?.payload?.message || 'Failed to save question');
        }
    }

    return (
        <div className="flex justify-center items-center w-full mx-auto p-6" >
            {/* Step 1: Add Question */}
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

                                {/* CKEditor for Option Text */}
                                <div className={`rounded-md overflow-hidden border-2 ${correctOption === index + 1 ? 'border border-green-400' : ' border-green-50'
                                    }`}>
                                    <CustomCKEditor
                                        content={option}
                                        setContent={(value) => handleOptionChange(index, value)}
                                    />
                                    {/* Correct Option and Remove Button */}
                                    <div className="flex justify-between items-center px-2 bg-white border border-t-0 border-gray-200">
                                        {/* Correct Option Radio Button */}
                                        <div
                                            onClick={() => handleCorrectOptionChange(index)}
                                            className="flex items-center space-x-2 py-1 cursor-pointer "
                                        >
                                            <div
                                                className={`h-4 w-4 rounded border-2 cursor-pointer ${correctOption === index + 1 ? 'bg-green-400 border-green-400' : 'border-gray-300'
                                                    } flex items-center justify-center`}
                                            >
                                                {correctOption === index + 1 && (
                                                    <svg
                                                        className="w-3 h-3 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <label className={`ml-2 text-sm text-gray-700 cursor-pointer ${correctOption === index + 1 ? 'text-green-500' : ''
                                                }`}>Set as correct answer</label>
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
                                {optionErrors[index] && formSubmitted && <FormErrorMessage message="Option is required" />}
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

                    {/* Next Button */}
                    <button
                        // onClick={nextStep}
                        onClick={(e) => handleSave(e)}
                        className="mt-4 py-2 px-4 bg-[#1BC5BD] text-white rounded-sm font-semibold hover:bg-[#18b7af] transition duration-200"
                    >
                        Save Question
                    </button>
                </div>
            )}

            {/* Step 2: Skill Topic, Time Period, tags, default time and Default Marks */}
            {currentStep === 2 && (
                <QuestionStepTwo
                    questionId={currentQuestionId}
                    questionData={questionData}
                    nextStep={nextStep}
                    prevStep={prevStep}
                />
            )}

            {/* Step 3: Solution */}
            {currentStep === 3 && (
                <QuestionStepThree
                    questionId={currentQuestionId}
                    questionData={questionData}
                    nextStep={nextStep}
                    prevStep={prevStep}
                />
            )}

            {/* Step 4: Attachment */}
            {currentStep === 4 && (
                <QuestionStepFour
                    questionId={currentQuestionId}
                    questionData={questionData}
                    nextStep={nextStep}
                    prevStep={prevStep}
                />
            )}
        </div>
    );
}

export default MultipleChoiceQuestionForm;
