interface FormSelectProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { label: string; value: string }[];
    required?: boolean;
    className?: string;
  }
  
  const FormSelect: React.FC<FormSelectProps> = ({
    label,
    value,
    onChange,
    options,
    required = false,
    className = "",
  }) => {
    return (
      <>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}  {/* Required indicator */}
        </label>
        <select
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-3 py-2 border rounded shadow-sm text-sm ${className}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </>
    );
  };
  
  export default FormSelect;
  