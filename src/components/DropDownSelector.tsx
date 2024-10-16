import React from 'react'
import { MdClose } from 'react-icons/md';

interface SelectProps {
    label: string;
    value: string;
    options: string[];
    setValue: (value: string) => void;
    required?: boolean;
    placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ label, value, options, setValue, required = false, placeholder = "Select" }) => {
    return (
        <div className="relative mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-text_secondary">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>} {/* Required indicator */}
            </label>
            <select
                value={value}
                required={required}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border rounded shadow-sm text-sm pr-10 dark:border-border_secondary dark:hover:border-hover_border"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            {value && (
                <button
                    onClick={() => setValue('')}
                    className="absolute right-4 top-[70%] transform -translate-y-1/2 text-red-500 hover:text-red-700"
                    aria-label={`Remove ${label.toLowerCase()}`}
                    type="button"
                >
                    <MdClose size={20} />
                </button>
            )}
        </div>
    );
};

export default Select;
