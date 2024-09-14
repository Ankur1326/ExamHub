'use client'
import { useEffect, useRef, ReactNode } from 'react';

interface ModalWrapperProps {
    onClose: () => void;
    onSave: () => void;
    title: string;
    isVisible: boolean;
    children: ReactNode;
    size?: 'small' | 'medium' | 'large'; // Control modal width
}

const sizeClass = {
    small: 'max-w-sm',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
};

export function EditOrCreateNewModalWrapper({ onClose, onSave, title, isVisible, children, size = 'small' }: ModalWrapperProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div ref={modalRef} className={`bg-white rounded-lg shadow-lg max-w-4xl transition-all duration-200 ease-in-out w-full ${sizeClass[size]} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
                        &times;
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: '75vh' }}>
                    {children}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-5 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Save
                    </button>
                </div>

            </div>
        </div>
    );
}
