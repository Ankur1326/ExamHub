import React, { useEffect, useState } from 'react'
import CustomCKEditor from '../CustomCKEditor';
import { FiEye } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { createOrUpdateQuestion } from '@/redux/slices/library/question-bank/questionSlice';
import { AppDispatch } from '@/redux/store';
import VideoTypeSelector from './VideoTypeSelector';
import ToggleSwitch from './ToggleSwitch';
import VideoLinkOrIdInput from './VideoLinkOrIdInput';

interface QuestionStepThreeProps {
    questionId: string | null;
    questionData?: any;
    nextStep: () => void;
    prevStep: () => void;
}

function QuestionStepThree({ questionId, questionData, nextStep, prevStep }: QuestionStepThreeProps) {
    const dispatch = useDispatch<AppDispatch>()
    const [solution, setSolution] = useState<string>('');
    const [enableSolutionVideo, setEnableSolutionVideo] = useState<boolean>(false);
    const [solutionVideoType, setSolutionVideoType] = useState<'mp4' | 'youtube' | 'vimeo'>('mp4');
    const [solutionVideoLink, setSolutionVideoLink] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [hint, setHint] = useState<string>('');

    useEffect(() => {
        setSolution(questionData?.solution)
        setEnableSolutionVideo(questionData?.enableSolutionVideo)
        setSolutionVideoType(questionData?.solutionVideoType)
        setSolutionVideoLink(questionData?.solutionVideoLink)
        setHint(questionData?.hint)
    }, [questionData])

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
        if (resultAction && createOrUpdateQuestion.fulfilled.match(resultAction)) {
            nextStep()
        }
    }

    return (
        <div className="p-6">
            {/* Solution Section */}
            <div className="mb-6">
                <label className="block text-lg font-semibold mb-2">Solution</label>
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
                <label className="block text-sm font-semibold mb-1">Hint</label>
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
                    className="px-6 py-2 bg-[#1BC5BD] text-white rounded-sm hover:bg-[#18b7af]"
                    onClick={handleUpdate}
                >
                    Update
                </button>
            </div>
        </div >
    )
}

export default QuestionStepThree
