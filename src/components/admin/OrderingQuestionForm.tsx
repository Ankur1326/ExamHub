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
import FixedNoteInfo from './FixedNoteInfo';
import dynamic from 'next/dynamic';
// import CustomCKEditor from '../CustomCKEditor';
const CustomCKEditor = dynamic(() => import("@/components/CustomCKEditor").then((module) => module.default), { ssr: false })


interface OrderingQuestionFormProps {
    currentStep: number;
    nextStep: () => void;
    prevStep: () => void;
    questionId: string;
}

const OrderingQuestionForm: React.FC<OrderingQuestionFormProps> = ({
    currentStep,
    nextStep,
    prevStep,
    questionId
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [question, setQuestion] = useState<string>('');
    const [sequences, setSequences] = useState<string[]>(['', '']);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [currentQuestionId, setCurrentQuestionId] = useState<string>("");
    const [sequenceErrors, setSequenceErrors] = useState<boolean[]>(new Array(sequences.length).fill(false));

    useEffect(() => {
        if (questionId) {
            const fetchQuestionDetails = async () => {
                try {
                    const response = await axios.get(`/api/admin/question/get-one/`, {
                        params: { questionId }
                    });
                    console.log(response.data.data);

                    setQuestion(response.data.data?.question);
                    setSequences(response.data.data?.sequences || ['', '']);
                    setCurrentQuestionId(response.data.data?._id || null);
                } catch (error) {
                    console.error('Failed to fetch question data:', error);
                }
            };
            fetchQuestionDetails();
        }
    }, [questionId]);

    const handleSequenceChange = (index: number, value: string) => {
        const updatedSequences = [...sequences];
        updatedSequences[index] = value;
        setSequences(updatedSequences);
        setSequenceErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = !value;
            return newErrors;
        });
    };

    const addSequence = () => {
        setSequences([...sequences, '']);
        setSequenceErrors((prev) => [...prev, false]);
    };

    const removeSequence = (index: number) => {
        const updatedSequences = sequences.filter((_, i) => i !== index);
        setSequences(updatedSequences);
        setSequenceErrors((prev) => prev.filter((_, i) => i !== index)); // Remove corresponding error state
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        setFormSubmitted(true);

        const newSequenceErrors = sequences.map(sequence => !sequence); // Validate all sequences
        setSequenceErrors(newSequenceErrors);

        if (newSequenceErrors.some(error => error)) {
            return; // Prevent submission if there are errors
        }

        if (!question) {
            toast.error('Question is required');
            return;
        }

        const newQuestion = {
            questionType: 'Ordering/Sequence',
            question,
            sequences
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
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-400">Question</label>
                        <CustomCKEditor content={question} setContent={setQuestion} />
                        {
                            !question && formSubmitted &&
                            <FormErrorMessage message="Question is required" />
                        }
                    </div>

                    {/* Sequences with drag and drop functionality */}
                    <div className="mt-6 w-full bg-slate-50 p-6">
                        <FixedNoteInfo text="Enter items in correct order. Items will automatically shuffle while showing to users." />
                        {sequences.map((sequence, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                                {/* Sequence Item */}
                                <div className="mb-2 text-sm font-semibold text-gray-700">
                                    {`Sequence Item ${index + 1}`}
                                </div>

                                {/* CKEditor for sequence Text */}
                                <div className={`rounded-md overflow-hidden`}>
                                    <CustomCKEditor
                                        content={sequence}
                                        setContent={(value) => handleSequenceChange(index, value)}
                                    />
                                    {/* Correct sequence and Remove Button */}
                                    <div className="flex justify-between items-center px-2 bg-white border border-t-0 border-gray-200">
                                        {/* Remove sequence Button */}
                                        <div></div>
                                        {sequences.length > 2 && (
                                            <span
                                                onClick={() => removeSequence(index)}
                                                className='py-1 px-1 rounded-full hover:bg-gray-100 cursor-pointer text-gray-700'
                                            >
                                                <MdDeleteOutline size={22} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {sequenceErrors[index] && formSubmitted && <FormErrorMessage message="Sequence is required" />}
                            </div>
                        ))}
                        {/* Button For Add New Sequence Item */}
                        <button
                            onClick={addSequence}
                            className="mt-6 w-full py-2 border border-dashed border-gray-600 text-black text-sm rounded-md hover:bg-gray-100 transition duration-200"
                        >
                            Add Sequence item
                        </button>
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

export default OrderingQuestionForm;
