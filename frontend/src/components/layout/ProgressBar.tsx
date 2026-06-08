'use client';

import { STEPS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/language-provider';

interface ProgressBarProps {
  currentStep: number; // 1-based
  totalSteps?: number;
}

export default function ProgressBar({ currentStep, totalSteps = 3 }: ProgressBarProps) {
  const { lang } = useLanguage();
  const thai = lang === 'th';
  const progress = Math.min(((currentStep - 1) / (totalSteps - 1)) * 100, 100);

  return (
    <div className="w-full">
      {/* Bar track */}
      <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
        {/* Filled portion */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-accent to-[#FFB340] transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-2">
        {STEPS.slice(0, totalSteps).map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <span
              key={step.id}
              className={cn(
                'text-[10px] sm:text-xs font-medium transition-colors duration-300',
                isCompleted && 'text-emerald-400',
                isActive && 'text-accent',
                !isCompleted && !isActive && 'text-white/30',
              )}
            >
              {thai ? step.label_th : step.label_en}
            </span>
          );
        })}
      </div>
    </div>
  );
}
