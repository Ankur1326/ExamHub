import { useEffect } from "react";
import { FaCheckCircle, FaTimes, FaTimesCircle } from "react-icons/fa";

interface AlertProps {
    type: "success" | "error";
    message: string;
    description?: any; // Optional description prop
    onClose: () => void;
}

const Alert = ({ type, message, description, onClose }: AlertProps) => {
    // useEffect(() => {
    //     // Auto-dismiss after 5 seconds
    //     const timer = setTimeout(() => {
    //         onClose();
    //     }, 5000);
    //     return () => clearTimeout(timer);
    // }, [onClose]);

    return (
        <div
            className={`px-4 py-3 mb-8 rounded-lg shadow-md flex items-start relative border-l-4 transition-transform transform ${type === "success" ? "dark:bg-gray-700 bg-green-50 dark:border-green-700 border-green-500" : "dark:bg-gray-700 bg-red-50 dark:border-red-700 border-red-500"
                } animate-slide-in`}
        >
            {/* Icon based on the type */}
            <div
                className={`p-2 rounded-full ${type === "success" ? "bg-green-100" : "bg-red-100"
                    } flex items-center justify-center`}
            >
                {type === "success" ? (
                    <FaCheckCircle className="text-green-600 text-xl" />
                ) : (
                    <FaTimesCircle className="text-red-600 text-xl" />
                )}
            </div>

            {/* Message and Description */}
            <div className="flex flex-col ml-4">
                <span className={`text-sm font-semibold dark:text-gray-100 text-gray-800`}>{message}</span>
                {description && (
                    <span className={"text-sm mt-1 dark:text-gray-400 text-gray-500"}>{description}</span>
                )}
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className={`absolute right-4 top-4 text-gray-500 dark:hover:text-gray-300 hover:text-gray-700 focus:outline-none`}
            >
                <FaTimes />
            </button>

            {/* Add subtle animation for entering */}
            <style jsx>{`
                .animate-slide-in {
                    animation: slide-in 0.5s ease-out;
                }
                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Alert;