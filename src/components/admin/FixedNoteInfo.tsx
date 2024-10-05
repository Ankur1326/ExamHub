import React from 'react'
import { CiCircleInfo } from 'react-icons/ci'
import { LuDot } from 'react-icons/lu'

function FixedNoteInfo({ text }: any) {
    return (
        <div className={`p-2 mb-8 text-sm rounded-lg shadow-sm flex items-center space-x-1 relative border-l-4 bg-red-50 border-red-500
        `}>
            <CiCircleInfo size={22} color='red' />
            <span className='text-red-600'>Note</span>
            <LuDot />
            <p className='text-gray-800'>{text}</p>
        </div>
    )
}

export default FixedNoteInfo
