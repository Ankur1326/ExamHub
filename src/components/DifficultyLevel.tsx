import React from 'react'
import { MdClose } from 'react-icons/md';

interface DifficultyLevelProps {
    difficulty: string;
    setDifficulty: (value: string) => void;
    required: boolean
}

const DifficultyLevel: React.FC<DifficultyLevelProps> = ({ difficulty, setDifficulty, required }) => {
    return (
        <div className="relative mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-text_secondary">
                Difficulty Level
                {required && <span className="text-red-500 ml-1">*</span>} {/* Required indicator */}
            </label>
            <select
                value={difficulty}
                required={required}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border rounded shadow-sm text-sm pr-10 dark:border-border_secondary dark:hover:border-hover_border" // Add pr-10 to avoid text overlap with the icon
            >
                <option value="">Select Difficulty</option>
                <option value="Very Easy">Very Easy</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
            </select>
            {difficulty && ( // Show the close icon only if there is a selected difficulty
                <button
                    onClick={() => setDifficulty('')}
                    className="absolute right-4 top-[70%] transform -translate-y-1/2 text-red-500 hover:text-red-700"
                    aria-label="Remove difficulty"
                    type="button"
                >
                    <MdClose size={20} /> {/* Close icon */}
                </button>
            )}
        </div>
    )
}

export default DifficultyLevel
