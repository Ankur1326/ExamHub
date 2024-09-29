import React, { useEffect, useState } from 'react';
import CustomCKEditor from '../CustomCKEditor';
import ToggleSwitch from './ToggleSwitch';
import VideoTypeSelector from './VideoTypeSelector';
import VideoLinkOrIdInput from './VideoLinkOrIdInput';
import SearchDropdown from '../SearchDropdown';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchComprehensions } from '@/redux/slices/library/question-bank/comprehensionsSlice';
import { FiEye } from 'react-icons/fi';
import { createOrUpdateQuestion } from '@/redux/slices/library/question-bank/questionSlice';

interface QuestionStepThreeProps {
    questionId: string | null;
    questionData?: any;
    nextStep: () => void;
    prevStep: () => void;
}

function QuestionStepFour({ questionId, questionData, nextStep, prevStep }: QuestionStepThreeProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [enableQuestionAttachment, setEnableQuestionAttachment] = useState<boolean>(false);
    const [attachmentType, setAttachmentType] = useState<'comprehensionPassage' | 'audio' | 'video'>('comprehensionPassage');
    const [comprehension, setComprehension] = useState<any>({})
    const [selectedFormat, setSelectedFormat] = useState<string>("mp3")
    const [audioLink, setAudioLink] = useState<string>("")
    const [showAudioPreview, setShowAudioPreview] = useState<boolean>(false);
    const [videoType, setVideoType] = useState<'mp4' | 'youtube' | 'vimeo'>("mp4")
    const [videoLinkOrId, setVideoLinkOrId] = useState<string>("")

    useEffect(() => {
        setEnableQuestionAttachment(questionData?.enableQuestionAttachment)
        setComprehension(questionData?.comprehensionPassage[0])
        setAttachmentType(questionData?.attachmentType)
        setSelectedFormat(questionData?.selectedFormat)
        setAudioLink(questionData?.audioLink)
        setVideoType(questionData?.videoType)
        setVideoLinkOrId(questionData?.videoLinkOrId)
    }, [questionData])

    // Handle the radio button change
    const handleAttachmentTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAttachmentType(event.target.value as 'comprehensionPassage' | 'audio' | 'video');
    };

    const fetchAllActiveItems = async (searchQuery: string, fetchAll: boolean) => {
        const response = await dispatch(fetchComprehensions({ title: searchQuery, fetchAll, isActive: true }));
        return response.payload.comprehensions || [];
    };

    const handleAudioPreview = () => {
        let audioUrl = '';

        // Check the selected audio format
        if (selectedFormat === 'mp3') {
            audioUrl = audioLink.endsWith('.mp3') ? audioLink : ''; // Validate it's an mp3 link
        } else if (selectedFormat === 'ogg') {
            audioUrl = audioLink.endsWith('.ogg') ? audioLink : ''; // Validate it's an ogg link
        }

        if (audioUrl) {
            window.open(audioUrl, '_blank'); // Open in a new tab for preview
        } else {
            alert('Please provide a valid audio link for the selected format.');
        }
    };

    const handleVideoPreview = () => {
        let videoUrl = '';

        if (videoType === 'mp4') {
            videoUrl = videoLinkOrId; // Direct MP4 link
        } else if (videoType === 'youtube') {
            videoUrl = `https://www.youtube.com/embed/${videoLinkOrId}`; // YouTube link
        } else if (videoType === 'vimeo') {
            videoUrl = `https://player.vimeo.com/video/${videoLinkOrId}`; // Vimeo link
        }
        if (videoUrl) {
            window.open(videoUrl, '_blank');
        } else {
            alert('Please provide a valid video link or ID.');
        }
    }

    const handleUpdate = async (e: any) => {
        e.preventDefault()

        let data: any = { enableQuestionAttachment, attachmentType };

        if (enableQuestionAttachment) {
            switch (attachmentType) {
                case 'comprehensionPassage':
                    data = { ...data, comprehensionPassageId: comprehension?._id }; // Safely access comprehension._id.
                    break;
                case 'audio':
                    data = { ...data, selectedFormat, audioLink };
                    break;
                case 'video':
                    data = { ...data, videoType, videoLinkOrId };
                    break;
                default:
                    break;
            }
        }

        let resultAction = await dispatch(createOrUpdateQuestion({ step: 4, data, questionId }));
        if (resultAction && createOrUpdateQuestion.fulfilled.match(resultAction)) {
            // nextStep()
        }
    }

    return (
        <div className="space-y-6 w-full md:w-2/3 mx-auto p-4 sm:p-6">
            {/* Enable Attachment Toggle */}
            <div className="mb-6">
                <ToggleSwitch
                    enabled={enableQuestionAttachment}
                    onToggle={() => setEnableQuestionAttachment(!enableQuestionAttachment)}
                    label="Enable Question Attachment"
                />
            </div>

            {enableQuestionAttachment && (
                <>
                    {/* Radio Buttons for selecting attachment type */}
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-6 space-y-4 sm:space-y-0">
                        {['comprehensionPassage', 'audio', 'video'].map((type) => (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="attachmentType"
                                    value={type}
                                    checked={attachmentType === type}
                                    onChange={handleAttachmentTypeChange}
                                    className="form-radio h-5 w-5 text-blue-600"
                                />
                                <span className="text-gray-700 capitalize">{type === 'comprehensionPassage' ? 'Comprehension Passage' : type}</span>
                            </label>
                        ))}
                    </div>

                    {/* Conditionally Render Content based on selected attachment type */}
                    <div className="">
                        {attachmentType === 'comprehensionPassage' && (
                            <SearchDropdown
                                label="Comprehension Passage"
                                placeholder="Search for a Passage..."
                                required={true}
                                fetchResults={fetchAllActiveItems}
                                sectionName={comprehension?.title}
                                onSelect={(comprehension: any) => {
                                    setComprehension(comprehension);
                                }}
                            />
                        )}

                        {attachmentType === 'audio' && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-1">Audio Type (Supported .mp3 & .ogg files)</label>
                                <div className="flex text-sm border border-slate-200 w-fit overflow-hidden rounded-md">
                                    {
                                        [{ format: 'mp3', label: 'MP3 Format' }, { format: 'ogg', label: 'OGG Format' }].map((item) => (
                                            <button
                                                key={item.format}
                                                className={`px-4 py-2 ${selectedFormat === item.format ? 'bg-slate-600 text-white' : 'bg-gray-50 text-gray-700'}`}
                                                onClick={() => setSelectedFormat(item.format)}
                                            >
                                                {item.label}
                                            </button>
                                        ))
                                    }
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-semibold mb-1">Audio Link</label>
                                    <div className="flex items-center overflow-hidden border border-slate-200 rounded-md">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-l-md text-sm"
                                            required={attachmentType === 'audio'}
                                            placeholder="Enter"
                                            value={audioLink}
                                            onChange={(e) => setAudioLink(e.target.value)}
                                        />
                                        {/* Preview Button with Icon */}
                                        <button
                                            className="flex items-center text-sm px-4 py-2 bg-slate-600 text-white hover:bg-slate-700"
                                            onClick={handleAudioPreview}
                                        >
                                            <FiEye className="mr-2" />
                                            Preview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {attachmentType === 'video' && (
                            <div>
                                <VideoTypeSelector selectedType={videoType} onChange={setVideoType} />
                                <VideoLinkOrIdInput
                                    videoType={videoType}
                                    videoLink={videoLinkOrId}
                                    enableVideo={true}
                                    setSolutionVideoLink={setVideoLinkOrId}
                                    handlePreview={handleVideoPreview}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Step Navigation Buttons */}
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
        </div>
    );
}

export default QuestionStepFour;
