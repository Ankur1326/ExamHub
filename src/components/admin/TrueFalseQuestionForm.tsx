import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { createOrUpdateQuestion } from '@/redux/slices/library/question-bank/questionSlice';
import FormErrorMessage from '../FormErrorMessage';
import toast from 'react-hot-toast';
import QuestionStepTwo from './QuestionStepTwo';
import QuestionStepThree from './QuestionStepThree';
import QuestionStepFour from './QuestionStepFour';
import axios from 'axios';
import dynamic from 'next/dynamic';
// import CustomCKEditor from '../CustomCKEditor';
const CustomCKEditor = dynamic(() => import("@/components/CustomCKEditor").then((module) => module.default), { ssr: false })

interface TrueFalseQuestionFormProps {
    currentStep: number;
    nextStep: () => void;
    prevStep: () => void;
    questionId: string;
}

const TrueFalseQuestionForm: React.FC<TrueFalseQuestionFormProps> = ({
    currentStep,
    nextStep,
    prevStep,
    questionId,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [question, setQuestion] = useState<string>('');
    const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [currentQuestionId, setCurrentQuestionId] = useState<string>("");

    useEffect(() => {
        if (questionId) {
            const fetchQuestionDetails = async () => {
                try {
                    const response = await axios.get(`/api/admin/question/get-one/`, {
                        params: { questionId }
                    });
                    setQuestion(response.data.data.question);
                    setTrueFalseAnswer(response.data.data?.trueFalseAnswer);
                    setCurrentQuestionId(response.data.data?._id || null);
                } catch (error) {
                    console.error('Failed to fetch question data:', error);
                }
            };
            fetchQuestionDetails();
        }
    }, [questionId]);

    // Handle setting the correct answer
    const handleAnswerSelect = (answer: true | false) => {
        setTrueFalseAnswer(answer);
    };
    const handleSave = async (e: any) => {
        e.preventDefault();
        setFormSubmitted(true);

        if (!question) {
            toast.error("Please provide a question");
            return;
        }
        if (trueFalseAnswer === null) {
            toast.error("Please specify the correct answer");
            return;
        }

        const newQuestion = {
            questionType: 'TOF',
            question: question,
            trueFalseAnswer,
        };

        const resultAction = await dispatch(createOrUpdateQuestion({ step: 1, data: newQuestion, questionId: currentQuestionId }));

        if (resultAction && createOrUpdateQuestion.fulfilled.match(resultAction)) {
            console.log("resultAction.payload.questionId :", resultAction.payload.questionId)
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
            {/* Step 1: Add Question */}
            {currentStep === 1 && (
                <div className="space-y-6 flex flex-col items-end w-full md:w-2/3">
                    {/* Question */}
                    <div className="w-full">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-400">Question</label>
                        <CustomCKEditor content={question} setContent={setQuestion} />
                        {!question && formSubmitted && <FormErrorMessage message="Question is required" />}
                    </div>

                    {/* True/False Options */}
                    <div className="space-y-6 flex flex-col items-start w-full justify-start">
                        {/* True Option */}
                        <div className="flex items-start space-x-4">
                            <div
                                className={`w-5 h-5 border-2 rounded-full flex justify-center items-center mr-2 
                                                ${trueFalseAnswer === true ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}
                            >
                                {trueFalseAnswer === true && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                )}
                            </div>
                            <div
                                className="flex flex-col gap-4 cursor-pointer"
                                onClick={() => handleAnswerSelect(true)}
                            >
                                <span className={`${trueFalseAnswer === true ? 'text-green-500' : 'text-gray-700 dark:text-slate-400'} text-sm font-semibold`}>
                                    This answer is correct
                                </span>
                                <input
                                    type="text"
                                    value="True"
                                    readOnly
                                    className={`border px-4 py-2 rounded-md w-full
                                         ${trueFalseAnswer === true ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-700 dark:text-slate-400 dark:border-border_secondary'}`}
                                />
                            </div>
                        </div>
                        {/* False Option */}
                        <div className="flex items-start space-x-4">
                            <div
                                className={`w-5 h-5 border-2 rounded-full flex justify-center items-center mr-2 
                        ${trueFalseAnswer === false ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}
                            >
                                {trueFalseAnswer === false && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                )}
                            </div>
                            <div
                                className="flex flex-col gap-4 cursor-pointer"
                                onClick={() => handleAnswerSelect(false)}
                            >
                                <span className={`${trueFalseAnswer === false ? 'text-green-500' : 'text-gray-700 dark:text-slate-400'} text-sm font-semibold`}>
                                    This answer is correct
                                </span>
                                <input
                                    type="text"
                                    value="False"
                                    readOnly
                                    className={`border px-4 py-2 rounded-md w-full 
                                        ${trueFalseAnswer === false ? 'border-green-500 text-green-500' : 'border-gray-300 dark:border-border_secondary text-gray-700 dark:text-slate-400'}`}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Save Button */}
                    <button
                        onClick={(e) => handleSave(e)}
                        className="mt-4 py-2 px-4 bg-blue_button hover:bg-blue_hover_button text-white rounded-sm font-semibold transition duration-200"
                    >
                        Save & Next
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

export default TrueFalseQuestionForm;
