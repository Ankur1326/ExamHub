import React from 'react'
import toast from 'react-hot-toast'
import KtIcon from './KtIcon'

const CopyButton: React.FC<{ text: string }> = ({ text }) => (
    <button
        className="bg-[#3699FF] hover:bg-[#3291F0] dark:bg-gray-700 text-white px-2 py-1 text-xs rounded flex items-center focus:outline-none"
        onClick={() => {
            navigator.clipboard.writeText(text)
            toast.success("copied!")
        }
        }
    >
        <KtIcon size={16} className="mr-1 text-white dark:text-text_secondary" filePath="/media/icons/duotune/general/gen054.svg" />
        <span className="dark:text-text_secondary">
            {text}
        </span>
    </button>
)

export default CopyButton
