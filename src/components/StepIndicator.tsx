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
    <div className="flex justify-center items-center space-x-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          {/* Step Circle */}
          <div
            onClick={() => handleStepClick(index)}
            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 outline outline-1 outline-offset-[2px] outline-[#c7dffd] ${isEdit ? 'cursor-pointer hover:outline-[#93c5ff]' : ""} ${currentStep === index + 1
              ? 'bg-[#3699FF] border-[#3394f5] text-white'  // Current step (blue)
              : currentStep > index + 1
                ? 'bg-[#E9F3FF] border-[#c7dffd] text-[#3699FF]'  // Completed step (green)
                : 'bg-white border-[#c7dffd] text-[#3394f5]'  // Upcoming step (gray)
              }`}
          >
            {index + 1}
          </div>

          {/* Step Details */}
          <div className="ml-3 text-left">
            <div
              className={`font-semibold ${currentStep === index + 1
                ? 'text-[#3699FF]'  // Current step text (blue)
                : currentStep > index + 1
                  ? 'text-[#3699FF]'  // Completed step text (green)
                  : 'text-[#c7dffd]'   // Upcoming step text (gray)
                }`}
            >
              {step.label}
            </div>
            <div className="text-xs text-gray-500">{step?.description}</div>
          </div>

          {/* Divider (between steps) */}
          {index < steps.length - 1 && (
            <div className={`w-8 h-px mx-4 ${currentStep > index + 1
              ? 'bg-[#3699FF]'   // Divider for completed step (green)
              : currentStep === index + 1
                ? 'bg-[#3699FF]'   // Divider for current step (blue)
                : 'bg-gray-400'    // Divider for upcoming steps (gray)
              }`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
