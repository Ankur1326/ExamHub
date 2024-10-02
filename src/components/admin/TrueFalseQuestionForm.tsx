import React, { useEffect, useState } from 'react';
import CustomCKEditor from '../CustomCKEditor';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { createOrUpdateQuestion } from '@/redux/slices/library/question-bank/questionSlice';
import FormErrorMessage from '../FormErrorMessage';
import toast from 'react-hot-toast';
import QuestionStepTwo from './QuestionStepTwo';
import QuestionStepThree from './QuestionStepThree';
import QuestionStepFour from './QuestionStepFour';

interface TrueFalseQuestionFormProps {
    currentStep: number;
    nextStep: () => void;
    prevStep: () => void;
    questionData?: any;
}

const TrueFalseQuestionForm: React.FC<TrueFalseQuestionFormProps> = ({
    currentStep,
    nextStep,
    prevStep,
    questionData
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [question, setQuestion] = useState<string>('');
    const [correctAnswer, setCorrectAnswer] = useState<'true' | 'false' | null>(null);
    const [options, setOptions] = useState<string[]>(['', '']);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);

    useEffect(() => {
        if (questionData) {
            setQuestion(questionData?.question || '');
            setCorrectAnswer(questionData.correctAnswer !== undefined ? questionData.correctAnswer : null);
            setCurrentQuestionId(questionData?._id || null);
        }
    }, [questionData]);

    // Handle setting the correct answer
    const handleAnswerSelect = (answer: 'true' | 'false') => {
        setCorrectAnswer(answer);
    };
    const handleSave = async (e: any) => {
        e.preventDefault();
        setFormSubmitted(true);

        if (!question) {
            toast.error("Please provide a question");
            return;
        }
        if (correctAnswer === null) {
            toast.error("Please specify the correct answer");
            return;
        }

        const newQuestion = {
            questionType: 'True/False',
            question: question,
            correctAnswer: correctAnswer,
        };

        console.log(newQuestion);

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
        <div className="flex justify-center items-center w-full mx-auto p-6">
            {/* Step 1: Add Question */}
            {currentStep === 1 && (
                <div className="space-y-6 flex flex-col items-end w-full md:w-2/3">
                    {/* Question */}
                    <div className="w-full">
                        <label className="text-sm font-semibold text-gray-700">Question</label>
                        <CustomCKEditor content={question} setContent={setQuestion} />
                        {!question && formSubmitted && <FormErrorMessage message="Question is required" />}
                    </div>

                    {/* True/False Options */}
                    <div className="space-y-6 flex flex-col items-start w-full md:w-2/3 mx-auto">
                        {/* True Option */}
                        <div className="flex items-center space-x-4">
                            <div
                                className="flex items-center cursor-pointer"
                                onClick={() => handleAnswerSelect('true')}
                            >
                                <div
                                    className={`w-5 h-5 border-2 rounded-full flex justify-center items-center mr-2 
                        ${correctAnswer === 'true' ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}
                                >
                                    {correctAnswer === 'true' && (
                                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                    )}
                                </div>
                                <span className={`${correctAnswer === 'true' ? 'text-green-500' : 'text-gray-700'} text-sm font-semibold`}>
                                    This answer is correct
                                </span>
                            </div>
                            <input
                                type="text"
                                value="True"
                                readOnly
                                className={`border px-4 py-2 rounded-md w-full
                    ${correctAnswer === 'true' ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-700'}`}
                            />
                        </div>

                        {/* False Option */}
                        <div className="flex items-center space-x-4">
                            <div
                                className="flex items-center cursor-pointer"
                                onClick={() => handleAnswerSelect('false')}
                            >
                                <div
                                    className={`w-5 h-5 border-2 rounded-full flex justify-center items-center mr-2 
                        ${correctAnswer === 'false' ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}
                                >
                                    {correctAnswer === 'false' && (
                                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                    )}
                                </div>
                                <span className={`${correctAnswer === 'false' ? 'text-green-500' : 'text-gray-700'} text-sm font-semibold`}>
                                    This answer is correct
                                </span>
                            </div>
                            <input
                                type="text"
                                value="False"
                                readOnly
                                className={`border px-4 py-2 rounded-md w-full
                    ${correctAnswer === 'false' ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-700'}`}
                            />
                        </div>
                    </div>
                    {/* Save Button */}
                    <button
                        onClick={(e) => handleSave(e)}
                        className="mt-4 py-2 px-4 bg-[#1BC5BD] text-white rounded-sm font-semibold hover:bg-[#18b7af] transition duration-200"
                    >
                        Save Question
                    </button>
                </div>
            )}

            {/* Step 2: Additional Question Details */}
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
};

export default TrueFalseQuestionForm;
