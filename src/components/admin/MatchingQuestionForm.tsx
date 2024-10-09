import React, { useEffect, useState } from 'react';
const CustomCKEditor = dynamic(() => import("@/components/CustomCKEditor").then((module) => module.default), { ssr: false })
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
import FixedNoteInfo from './FixedNoteInfo';
import dynamic from 'next/dynamic';

interface MatchingQuestionFormProps {
    currentStep: number;
    nextStep: () => void;
    prevStep: () => void;
    questionId: string;
}

const MatchingQuestionForm: React.FC<MatchingQuestionFormProps> = ({
    currentStep,
    nextStep,
    prevStep,
    questionId,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [question, setQuestion] = useState<string>('');
    const [pairs, setPairs] = useState<{ left: string; right: string }[]>([
        { left: '', right: '' },
    ]);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [pairErrors, setPairErrors] = useState<boolean[]>(
        new Array(pairs.length).fill(false)
    );
    const [currentQuestionId, setCurrentQuestionId] = useState<string>('');

    useEffect(() => {
        if (questionId) {
            const fetchQuestionDetails = async () => {
                try {
                    const response = await axios.get(`/api/admin/question/get-one/`, {
                        params: { questionId },
                    });
                    setQuestion(response.data.data?.question);
                    const getPairs = response.data.data?.pairs || [{ left: '', right: '' }];
                    setPairs(getPairs);
                    console.log("response.data.data.pairs : ", response.data.data?.pairs);

                    setCurrentQuestionId(response.data.data?._id || '');
                } catch (error) {
                    console.error('Failed to fetch question data:', error);
                }
            };
            fetchQuestionDetails();
        }
    }, [questionId]);

    // Function to handle pair change
    const handlePairChange = (index: number, field: 'left' | 'right', value: string) => {
        const updatedPairs = [...pairs];
        updatedPairs[index][field] = value;
        setPairs(updatedPairs);
        setPairErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = !updatedPairs[index].left || !updatedPairs[index].right;
            return newErrors;
        });
    };

    // Function to add a new pair
    const addPair = () => {
        setPairs([...pairs, { left: '', right: '' }]);
        setPairErrors((prev) => [...prev, false]);
    };

    // Function to remove a pair
    const removePair = (index: number) => {
        const updatedPairs = pairs.filter((_, i) => i !== index);
        setPairs(updatedPairs);
        setPairErrors((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        setFormSubmitted(true);

        const newPairErrors = pairs.map((pair) => !pair.left || !pair.right);
        setPairErrors(newPairErrors);

        if (newPairErrors.some((error) => error)) {
            return; // Prevent submission if there are errors
        }

        const newQuestion = {
            questionType: 'Match the Following',
            question: question,
            pairs: pairs,
        };

        // console.log(newQuestion);

        const resultAction = await dispatch(
            createOrUpdateQuestion({
                step: 1,
                data: newQuestion,
                questionId: currentQuestionId,
            })
        );

        if (resultAction && createOrUpdateQuestion.fulfilled.match(resultAction)) {
            if (!currentQuestionId) {
                setCurrentQuestionId(resultAction.payload.questionId);
            }
            nextStep();
        } else {
            console.error('Failed to save question:', resultAction?.payload?.message);
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
                        {!question && formSubmitted && <FormErrorMessage message="Question is required" />}
                    </div>

                    {/* Pairs */}
                    <div className="mt-6 w-full bg-slate-50 p-6">
                        
                        <FixedNoteInfo text="Enter pairs in correct order. Pairs will automatically shuffle while showing to users." />
                        {pairs.map((pair, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                                <div className="mb-1 text-sm flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">
                                        {`Pair ${index + 1}`}
                                    </span>
                                    {/* Remove Pair Button */}
                                    {pairs.length > 1 && (
                                        <span
                                            onClick={() => removePair(index)}
                                            className="py-1 px-1 rounded-full hover:bg-gray-100 cursor-pointer text-gray-700"
                                        >
                                            <MdDeleteOutline size={22} />
                                        </span>
                                    )}
                                </div>
                                <div className="flex space-x-4">
                                    <div className="w-1/2">
                                        <label className="text-xs font-semibold text-gray-700">Left</label>
                                        <CustomCKEditor
                                            content={pair.left}
                                            setContent={(value) => handlePairChange(index, 'left', value)}
                                        />
                                        {pairErrors[index] && !pair.left && formSubmitted && (
                                            <FormErrorMessage message="Left side is required" />
                                        )}
                                    </div>
                                    <div className="w-1/2">
                                        <label className="text-xs font-semibold text-gray-700">Right</label>
                                        <CustomCKEditor
                                            content={pair.right}
                                            setContent={(value) => handlePairChange(index, 'right', value)}
                                        />
                                        {pairErrors[index] && !pair.right && formSubmitted && (
                                            <FormErrorMessage message="Right side is required" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Pair Button */}
                        <button
                            onClick={addPair}
                            className="mt-6 w-full py-2 border border-dashed border-gray-600 text-black text-sm rounded-md hover:bg-gray-100 transition duration-200"
                        >
                            Add Pair
                        </button>
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={(e) => handleSave(e)}
                        className="mt-4 py-2 px-4 bg-blue_button hover:bg-blue_hover_button text-white rounded-sm font-semibold transition duration-200"
                    >
                        Save & Next
                    </button>
                </div>
            )}

            {/* Other steps here */}
            {currentStep === 2 && (
                <QuestionStepTwo questionId={currentQuestionId} nextStep={nextStep} prevStep={prevStep} />
            )}

            {currentStep === 3 && (
                <QuestionStepThree questionId={currentQuestionId} nextStep={nextStep} prevStep={prevStep} />
            )}

            {currentStep === 4 && (
                <QuestionStepFour questionId={currentQuestionId} nextStep={nextStep} prevStep={prevStep} />
            )}
        </>
    );
};

export default MatchingQuestionForm;
