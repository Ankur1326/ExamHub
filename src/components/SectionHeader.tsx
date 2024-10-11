import React from 'react'
import { IoAddSharp } from "react-icons/io5";
import KtIcon from './KtIcon';

function SectionHeader({ title, onClick, buttonText="Create" }: any) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-600 dark:text-text_primary">{title}</h2>
            <button
                onClick={onClick}
                className="bg-blue_button text-white flex items-center gap-1 px-3 py-2 hover:bg-blue_hover_button rounded-sm transition duration-200 ease-in-out"
            >
                <KtIcon size={20} className="text-white" filePath="/media/icons/duotune/arrows/arr075.svg" />
                <span className='text-xs'>{buttonText}</span>
            </button>
        </div>
    )
}

export default SectionHeader
