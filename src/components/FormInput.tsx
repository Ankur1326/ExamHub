interface FormInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disable?:boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  disable = false,
  placeholder = "",
  className = "",
}) => {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}  {/* Required indicator */}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disable || false}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded shadow-sm text-sm ${className}`}
      />
    </>
  );
};

export default FormInput;
