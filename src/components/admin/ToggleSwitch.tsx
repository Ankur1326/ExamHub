import React from 'react';

interface ToggleSwitchProps {
    enabled: boolean;
    onToggle: () => void;
    label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle, label }) => {
    return (
        <div className="mb-6">
            <label className="block text-sm text-gray-800 mb-1 dark:text-text_secondary">{label}</label>
            <div className="flex space-x-4">
                <label className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={onToggle}
                        className="sr-only"
                    />
                    <div
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
                            enabled ? 'bg-slate-600' : 'bg-gray-300'
                        }`}
                    >
                        <div
                            className={`toggle-ball absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                                enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        ></div>
                    </div>
                </label>
            </div>
        </div>
    );
};

export default ToggleSwitch;
