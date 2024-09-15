interface FormTextareaProps {
    label: string;                               // Label text for the textarea
    value: string;                               // Current value of the textarea
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;  // Change handler
    required?: boolean;                          // Whether the field is required (default is false)
    className?: string;                          // Optional additional classes for customization
    rows?: number;                               // Number of rows for the textarea
    placeholder?: string;                        // Placeholder text
}

const FormTextarea: React.FC<FormTextareaProps> = ({
    label,
    value,
    onChange,
    required = false,
    className = "",
    rows = 4,
    placeholder = "",
}) => {
    return (
        <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>} {/* Required indicator */}
            </label>
            <textarea
                value={value}
                onChange={onChange}
                required={required}
                rows={rows}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded shadow-sm text-sm resize-none ${className}`}
            />
        </>
    );
};

export default FormTextarea;
