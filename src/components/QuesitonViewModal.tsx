import { FaRegCircleCheck } from "react-icons/fa6";
import { FiCopy, FiEye } from "react-icons/fi";
import ModalContainer from "@/components/ModalContainer";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import axios from "axios";

interface QuestionViewModalProps {
    onClose: () => void;
    title: string;
    questionId: string;
    isVisible: boolean;
    size?: 'small' | 'medium' | 'large' | 'very_large';
}

// Main Modal Component
export function QuestionViewModal({ title, questionId, isVisible, onClose, size = 'medium' }: QuestionViewModalProps) {
    const [questionData, setQuestionData] = useState<any>({});
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (questionId) {
            const fetchQuestionDetails = async () => {
                try {
                    const response = await axios.get(`/api/admin/question/get-one/`, { params: { questionId } });
                    console.log(response.data.data);
                    setQuestionData(response.data.data);
                } catch (error) {
                    console.error('Failed to fetch question data:', error);
                }
            };
            fetchQuestionDetails();
        }
    }, [questionId]);

    const handlePreview = (type: string, link: string) => {
        let videoUrl = '';
        if (type === 'mp4') {
            videoUrl = link;
        } else if (type === 'youtube') {
            videoUrl = `https://www.youtube.com/embed/${link}`;
        } else if (type === 'vimeo') {
            videoUrl = `https://player.vimeo.com/video/${link}`;
        }
        if (videoUrl) {
            window.open(videoUrl, '_blank');
        } else {
            alert('Please provide a valid video link or ID.');
        }
    };

    return (
        <ModalContainer title={title} isVisible={isVisible} onClose={onClose} size={size}>
            <div className="space-y-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md shadow-lg">
                {/* Question Content */}
                <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm" dangerouslySetInnerHTML={{ __html: questionData?.question }} />

                {/* Options Section */}
                {questionData?.options && (
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                        <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-gray-300">Options:</h3>
                        <ul className="grid grid-cols-2 gap-4">
                            {questionData.options.map((option: any, index: number) => (
                                <li key={index} className="flex items-center border dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-700">
                                    <span className="text-xs bg-blue-50 text-blue-600 py-1 px-2 rounded-full mr-2">{index + 1}</span>
                                    <div dangerouslySetInnerHTML={{ __html: option.text }} />
                                    {option.isCorrect && <FaRegCircleCheck className="ml-auto text-green-600" />}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Grouped Information */}
                <div className="grid grid-cols-2 gap-6">
                    <Section property="Question Type" value={questionData?.questionType} />
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Code:</span>
                        <CopyButton text={questionData?.questionCode} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Section property="Section" value={questionData?.sectionName} />
                    <Section property="Skill" value={questionData?.skillName} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Section property="Topic" value={questionData?.topicName} />
                    <TagList tags={questionData?.tagDetails || []} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Section property="Default Marks" value={questionData?.defaultMarks} />
                    <Section property="Default Time to Solve" value={questionData?.defaultTimeToSolve} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Section property="Difficulty Level" value={questionData?.difficultyLevel} />
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Status:</span>
                        <StatusBadge isActive={questionData.isActive} />
                    </div>
                </div>

                {/* Solution Section */}
                <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Solution:</h3>
                    <div
                        dangerouslySetInnerHTML={{ __html: questionData?.solution }}
                        className="prose max-w-none border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 rounded-md h-48 overflow-auto"
                    />
                </div>

                {/* Solution Video */}
                <div className="flex items-center gap-6 bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Solution Video:</span>
                    {questionData?.enableSolutionVideo ? (
                        questionData?.solutionVideoLink ? (
                            <button
                                className="flex items-center text-sm px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white hover:bg-gray-700 dark:hover:bg-gray-400"
                                onClick={() => handlePreview(questionData?.solutionVideoType, questionData.solutionVideoLink)}
                            >
                                <FiEye className="mr-2" />
                                Preview
                            </button>
                        ) : "N/A"
                    ) : (
                        "No"
                    )}
                </div>

                {/* Hint Section */}
                <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Hint:</h3>
                    <div
                        dangerouslySetInnerHTML={{ __html: questionData?.hint }}
                        className="prose max-w-none border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 rounded-md h-48 overflow-auto"
                    />
                </div>

                {/* Attachment Section */}
                <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Attachment:</h3>
                    <div className="flex gap-3">
                        <Section property="Attachment Type" value={questionData?.attachmentType === "comprehensionPassage" ? 'Comprehension Passage' : ""} />
                        <Section property="Title" value={questionData?.comprehensionPassage?.[0]?.title} />
                    </div>

                    {questionData?.enableQuestionAttachment ? (
                        questionData?.attachmentType === "comprehensionPassage" ? (
                            <div className="mt-3">
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Body:</span>
                                <div
                                    dangerouslySetInnerHTML={{ __html: questionData?.comprehensionPassage?.[0]?.body }}
                                    className="border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 rounded-md h-48 overflow-auto"
                                />
                            </div>
                        ) : (
                            <span className="text-green-500 text-sm">Yes</span>
                        )
                    ) : (
                        "No"
                    )}
                </div>
            </div>
        </ModalContainer>
    );
}

// Section Component for displaying key-value pairs
const Section: React.FC<{ property: string, value: string | number }> = ({ property, value }) => (
    <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{property}:</span>
        <span className="text-sm text-gray-800 dark:text-gray-200">{value || 'N/A'}</span>
    </div>
);

// Copy Button for copying text
const CopyButton: React.FC<{ text: string }> = ({ text }) => (
    <button
        className="bg-blue-600 text-white px-2 py-1 text-xs rounded flex items-center hover:bg-blue-700"
        onClick={() => {
            navigator.clipboard.writeText(text);
            toast.success("Copied!");
        }}
    >
        <FiCopy className="mr-1" />
        {text}
    </button>
);

// Badge for question status
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <span className={`px-2 py-1 text-xs rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        {isActive ? "Active" : "Inactive"}
    </span>
);

// Tag List for displaying tags
const TagList: React.FC<{ tags: any[] }> = ({ tags }) => (
    <div className="flex items-center gap-2">
        {tags.map((tag, index) => (
            <span key={index} className="text-sm bg-blue-100 text-blue-600 rounded-full px-2 py-1">
                {tag.name}
            </span>
        ))}
    </div>
);
