import React from 'react';
import { FiEye } from 'react-icons/fi';

interface VideoLinkOrIdInputProps {
    videoType: 'mp4' | 'youtube' | 'vimeo';
    videoLink: string;
    enableVideo: boolean;
    setSolutionVideoLink: (link: string) => void;
    handlePreview: () => void;
}

const VideoLinkOrIdInput: React.FC<VideoLinkOrIdInputProps> = ({
    videoType,
    videoLink,
    enableVideo,
    setSolutionVideoLink,
    handlePreview
}) => {
    const label = videoType === 'mp4'
        ? 'MP4 Video URL' 
        : videoType === 'youtube' 
        ? 'YouTube Video ID' 
        : 'Vimeo Video ID';

    const placeholder = videoType === 'mp4'
        ? 'Enter MP4 video link'
        : videoType === 'youtube'
        ? 'Enter YouTube video ID'
        : 'Enter Vimeo video ID';

    return (
        <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <div className="flex items-center overflow-hidden border border-slate-200 rounded-md">
                <input
                    type="text"
                    className="w-full px-4 py-2 rounded-l-md text-sm"
                    required={enableVideo}
                    placeholder={placeholder}
                    value={videoLink}
                    onChange={(e) => setSolutionVideoLink(e.target.value)}
                />
                {/* Preview Button with Icon */}
                <button
                    className="flex items-center text-sm px-4 py-2 bg-slate-600 text-white hover:bg-slate-700"
                    onClick={handlePreview}
                >
                    <FiEye className="mr-2" />
                    Preview
                </button>
            </div>
        </div>
    );
};

export default VideoLinkOrIdInput;
