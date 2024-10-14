import React from 'react';
import SVG from 'react-inlinesvg';

interface KtIconProps {
    filePath: string; // Path to the SVG file in the public folder (e.g., '/icons/arrows/arr075.svg')
    size?: number; // Icon size
    className?: string; // Color in light mode (Tailwind class)
}

const KtIcon: React.FC<KtIconProps> = ({
    filePath,
    size = 24, // Default size
    className = '', // Default light mode color
}) => {
    return (
        <div
            className={`${className}`}
            style={{ width: size, height: size }}
        >
            <SVG
                src={filePath}
                width={size}
                height="auto"
                title=""
            />
        </div>
    );
};

export default KtIcon;
