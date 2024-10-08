import React from 'react';

interface VideoTypeSelectorProps {
    selectedType: string;
    onChange: (type: 'mp4' | 'youtube' | 'vimeo') => void;
}

const VideoTypeSelector: React.FC<VideoTypeSelectorProps> = ({ selectedType, onChange }) => {
    const videoTypes = ['mp4', 'youtube', 'vimeo'];

    return (
        <div className="mb-6">
            <label className="block text-sm font-semibold mb-1 dark:text-text_secondary">Video Type</label>
            <div className="flex text-sm border border-slate-200 dark:border-border_primary  w-fit overflow-hidden rounded-md">
                {
                    videoTypes.map((type) => (
                        <VideoTypeButton
                            key={type}
                            type={type}
                            selectedType={selectedType}
                            onChange={onChange}
                        />
                    ))
                }
            </div>
        </div>
    );
};

const VideoTypeButton= ({ type, selectedType, onChange }:any) => {
    const getLabel = (type: 'mp4' | 'youtube' | 'vimeo') => {
        switch (type) {
            case 'mp4':
                return 'MP4 Video';
            case 'youtube':
                return 'YouTube Video';
            case 'vimeo':
                return 'Vimeo Video';
            default:
                return '';
        }
    };

    return (
        <button
            className={`px-4 py-2 ${selectedType === type ? 'bg-slate-600 text-white' : 'bg-gray-50 text-gray-700 dark:bg-bg_primary dark:text-text_secondary'}`}
            onClick={() => onChange(type)}
        >
            {getLabel(type)}
        </button>
    );
};

export default VideoTypeSelector;