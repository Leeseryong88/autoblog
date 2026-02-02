
import React from 'react';
import { AppStep } from '../types';

interface StepProgressProps {
  currentStep: AppStep;
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const steps = [
    { key: AppStep.UPLOAD, label: '사진 업로드', icon: 'fa-images' },
    { key: AppStep.INFO, label: '정보 입력', icon: 'fa-pen-to-square' },
    { key: AppStep.GENERATING, label: 'AI 작성 중', icon: 'fa-robot' },
    { key: AppStep.RESULT, label: '결과 확인', icon: 'fa-check-circle' },
  ];

  const getStepIndex = (step: AppStep) => steps.findIndex(s => s.key === step);
  const currentIndex = getStepIndex(currentStep);

  // SELECT_TYPE 단계에서는 프로그레스를 보이지 않거나 다르게 처리할 수 있음
  if (currentIndex === -1) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-green-500 -z-10 transition-all duration-500 ease-in-out transform -translate-y-1/2"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300
              ${index <= currentIndex ? 'bg-green-500 text-white shadow-lg' : 'bg-white text-gray-400 border-2 border-gray-200'}
            `}>
              <i className={`fas ${step.icon}`}></i>
            </div>
            <span className={`text-xs mt-2 font-medium ${index <= currentIndex ? 'text-green-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;
