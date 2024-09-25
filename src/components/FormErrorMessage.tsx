import React from 'react';

interface FormErrorMessageProps {
    message: string;
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ message }) => {
    return (
        <div className="text-xs font-semibold text-red-500 mt-1">
            {message}
        </div>
    );
};

export default FormErrorMessage;
