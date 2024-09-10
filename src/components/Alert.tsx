import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimes, FaTimesCircle } from "react-icons/fa";

interface AlertProps {
    type: "success" | "error";
    message: string;
    onClose: () => void;
}

const Alert = ({ type, message, onClose }: AlertProps) => {
    useEffect(() => {
        // Auto-dismiss after 3 seconds
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`top-4 right-4 p-4 mb-4 rounded-lg shadow-md flex items-center space-x-3 relative border-l-4 ${type === "success" ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
                }`}
            style={{ zIndex: 1000 }} // Ensure it's above all other elements
        >
            {type === "success" ? (
                <FaCheckCircle className="text-green-500 text-2xl" />
            ) : (
                <FaTimesCircle className="text-red-500 text-2xl" />
            )}
            <span className="text-sm font-medium text-gray-700">{message}</span>
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-600 hover:text-gray-900">
                <FaTimes />
            </button>
        </div>
    );
};