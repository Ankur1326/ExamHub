import React from 'react'

function SectionHeader({ title, onClick }: any) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-600">{title}</h2>
            <button
                onClick={onClick}
                className="bg-blue_button text-white text-sm flex items-center px-3 py-2 hover:bg-blue_hover_button transition duration-200 ease-in-out"
            >
                Create
            </button>
        </div>
    )
}

export default SectionHeader
