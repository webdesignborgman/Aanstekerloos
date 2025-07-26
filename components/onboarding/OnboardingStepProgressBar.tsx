// components/onboarding/OnboardingStepProgressBar.tsx
"use client";

import { Check } from "lucide-react";
import clsx from "clsx";

// Zet je stappen in één plek:
export const ONBOARDING_STEPS = [
  { key: "motivatie", label: "Motivatie" },
  { key: "coping", label: "Coping" },
  { key: "rookgedrag", label: "Gewoontes" },
  { key: "triggers", label: "Triggers" },
  { key: "stopdatum", label: "Stopdatum" },
  { key: "steun", label: "Steun" }
] as const;

type Props = {
  currentStep: number; // 0-based index
  completedSteps: number; // aantal afgerond
};

export function OnboardingStepProgressBar({ currentStep, completedSteps }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8 w-full">
      {ONBOARDING_STEPS.map((step, i) => (
        <div key={step.key} className="flex flex-col items-center flex-1 relative">
          {/* Cirkel */}
          <div
            className={clsx(
              "w-9 h-9 rounded-full flex items-center justify-center font-bold text-base mb-1 z-10 transition-all",
              i < completedSteps
                ? "bg-green-500 text-white shadow-md"
                : i === currentStep
                ? "bg-orange-500 text-white animate-pulse"
                : "bg-orange-100 text-orange-400 border border-orange-300"
            )}
          >
            {i < completedSteps ? <Check size={22} /> : i + 1}
          </div>
          {/* Label */}
          <div
            className={clsx(
              "text-xs text-center whitespace-nowrap px-1 mt-1",
              i === currentStep ? "text-orange-700 font-semibold" : "text-orange-400"
            )}
          >
            {step.label}
          </div>
          {/* Lijn */}
          {i < ONBOARDING_STEPS.length - 1 && (
            <div className="absolute top-1/2 left-full w-full h-1 -translate-y-1/2 flex items-center">
              <div
                className={clsx(
                  "h-1 w-full",
                  i < completedSteps - 1 ? "bg-green-500" : "bg-orange-200"
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
