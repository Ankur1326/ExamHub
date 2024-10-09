import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { createOrUpdateQuestion } from '@/redux/slices/library/question-bank/questionSlice';
import { AppDispatch } from '@/redux/store';
import VideoTypeSelector from './VideoTypeSelector';
import ToggleSwitch from './ToggleSwitch';
import VideoLinkOrIdInput from './VideoLinkOrIdInput';
import axios from 'axios';
// import CustomCKEditor from '../CustomCKEditor';
import dynamic from 'next/dynamic';
const CustomCKEditor = dynamic(() => import("@/components/CustomCKEditor").then((module) => module.default), { ssr: false })


interface QuestionStepThreeProps {
    questionId: string;
    nextStep: () => void;
    prevStep: () => void;
}

function QuestionStepThree({ questionId, nextStep, prevStep }: QuestionStepThreeProps) {
    const dispatch = useDispatch<AppDispatch>()
    const [solution, setSolution] = useState<string>('');
    const [enableSolutionVideo, setEnableSolutionVideo] = useState<boolean>(false);
    const [solutionVideoType, setSolutionVideoType] = useState<string>('');
    const [solutionVideoLink, setSolutionVideoLink] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [hint, setHint] = useState<string>('');

    useEffect(() => {
        if (questionId) {
            const fetchQuestionDetails = async () => {
                try {
                    const response = await axios.get(`/api/admin/question/get-one/`, {
                        params: { questionId }
                    });
                    setSolution(response.data.data?.solution || "")
                    setEnableSolutionVideo(response.data.data?.enableSolutionVideo || false)
                    setSolutionVideoType(response.data.data.data?.solutionVideoType || "mp4")
                    setSolutionVideoLink(response.data.data?.solutionVideoLink || '')
                    setHint(response.data.data?.hint || '')
                } catch (error) {
                    console.error('Failed to fetch question data:', error);
                }
            };

            fetchQuestionDetails();
        }
    }, [questionId]);

    // Preview Video
    const handlePreview = () => {
        let videoUrl = '';

        if (solutionVideoType === 'mp4') {
            videoUrl = solutionVideoLink; // Direct MP4 link
        } else if (solutionVideoType === 'youtube') {
            videoUrl = `https://www.youtube.com/embed/${solutionVideoLink}`; // YouTube link
        } else if (solutionVideoType === 'vimeo') {
            videoUrl = `https://player.vimeo.com/video/${solutionVideoLink}`; // Vimeo link
        }
        if (videoUrl) {
            window.open(videoUrl, '_blank');
        } else {
            alert('Please provide a valid video link or ID.');
        }
    };

    const handleUpdate = async (e: any) => {
        e.preventDefault()
        let resultAction = await dispatch(createOrUpdateQuestion({ step: 3, data: { solution, enableSolutionVideo, solutionVideoType, solutionVideoLink, hint }, questionId }));
        if (resultAction && createOrUpdateQuestion?.fulfilled?.match(resultAction)) {
            nextStep()
        }
    }

    return (
        <div className="p-6">
            {/* Solution Section */}
            <div className="mb-6">
                <label className="block text-lg font-semibold mb-2 dark:text-text_secondary">Solution</label>
                <CustomCKEditor
                    content={solution} setContent={setSolution}
                />
            </div>

            {/* Enable Solution Video Switch */}
            <div className="mb-6">
                <ToggleSwitch
                    enabled={enableSolutionVideo}
                    onToggle={() => setEnableSolutionVideo(!enableSolutionVideo)}
                    label="Enable Solution Video"
                />
            </div>

            {/* Video Link Input (Conditional) */}
            {enableSolutionVideo && (
                <div className="mb-6">
                    <VideoTypeSelector selectedType={solutionVideoType} onChange={setSolutionVideoType} />
                    {/* Video Link Input */}
                    <VideoLinkOrIdInput
                        videoType={solutionVideoType}
                        videoLink={solutionVideoLink}
                        enableVideo={enableSolutionVideo}
                        setSolutionVideoLink={setSolutionVideoLink}
                        handlePreview={handlePreview}
                    />
                </div>
            )}

            {/* Video Preview Section */}
            {
                previewUrl && (
                    <div className="my-6">
                        <label className="block text-sm font-semibold mb-1">Video Preview</label>
                        {solutionVideoType === 'mp4' ? (
                            <video controls className="w-full rounded-md">
                                <source src={previewUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <iframe
                                src={previewUrl}
                                className="w-full aspect-video rounded-md"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Video Preview"
                            ></iframe>
                        )}
                    </div>
                )
            }

            {/* Hint Section */}
            <div className="my-12">
                <label className="block text-sm font-semibold mb-1 dark:text-text_secondary">Hint</label>
                <CustomCKEditor
                    content={hint} setContent={setHint}
                />
            </div>

            {/* Back and Update Buttons */}
            <div className="flex justify-between mt-6 items-center" >
                <div onClick={prevStep} className="py-2 px-6 bg-slate-100 text-gray-500 hover:text-black rounded-sm font-semibold border border-slate-300 cursor-pointer transition duration-200">
                    Back
                </div>
                <button
                    className="px-6 py-2 bg-blue_button hover:bg-blue_hover_button text-white rounded-sm"
                    onClick={handleUpdate}
                >
                    Save & Next
                </button>
            </div>
        </div >
    )
}

export default QuestionStepThree
