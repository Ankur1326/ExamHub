import React from 'react';

interface Step {
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: { label: string, description: string }[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isEdit: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, setCurrentStep, isEdit }) => {

  const handleStepClick = (index: number) => {
    if (isEdit) {
      setCurrentStep(index + 1); // Allow step navigation if in edit mode
    }
  };

  return (
    <div className="flex justify-center items-center space-x-8">  {/* Spaced-out step indicators */}
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          {/* Step Circle */}
          <div
            onClick={() => handleStepClick(index)}
            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 shadow-sm transition duration-200 ease-in-out transform hover:scale-105 ${isEdit ? 'cursor-pointer hover:border-blue-300' : ""
              } ${currentStep === index + 1
                ? 'bg-[#3699FF] border-[#3394f5] text-white'  // Current step (blue)
                : currentStep > index + 1
                  ? 'bg-[#E9F3FF] border-[#c7dffd] text-[#3699FF]'  // Completed step (blue)
                  : 'bg-white border-[#c7dffd] text-[#3699FF]'  // Upcoming step (gray)
              }`}
          >
            {index + 1}
          </div>

          {/* Step Details */}
          <div className="ml-4 text-left">
            <div
              className={`font-semibold ${currentStep === index + 1
                ? 'text-[#3699FF]'  // Current step text (blue)
                : currentStep > index + 1
                  ? 'text-[#3699FF]'  // Completed step text (blue)
                  : 'text-[#c7dffd]'   // Upcoming step text (gray)
                }`}
            >
              {step.label}
            </div>
            <div className="text-xs text-gray-500 mt-1">{step?.description}</div>
          </div>

          {/* Divider (between steps) */}
          {index < steps.length - 1 && (
            <div className={`w-12 h-px mx-4 transition-colors duration-300 ease-in-out ${currentStep > index + 1
              ? 'bg-[#3699FF]'   // Divider for completed step (blue)
              : currentStep === index + 1
                ? 'bg-[#3699FF]'   // Divider for current step (blue)
                : 'bg-gray-300'    // Divider for upcoming steps (gray)
              }`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;