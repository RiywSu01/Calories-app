'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { calculateAllMetrics } from '@/app/lib/calculations/bmr';
import { calculateMacros, GoalMode, MacroResult } from '@/app/lib/calculations/macros';
import { ActivityLevel, BMRResult, PersonalInfo, Step } from '@/app/lib/types';
import { getAge } from '@/app/lib/database/profile';
import { submitProfileApi, UserProfileExists } from '@/app/lib/api/profile';
import StepDots from '@/app/components/profile-setup/StepDots';
import Step1PersonalInfo from '@/app/components/profile-setup/Step1PersonalInfo';
import Step2ActivityLevel from '@/app/components/profile-setup/Step2ActivityLevel';
import Step3Results from '@/app/components/profile-setup/Step3Results';
import ProfileSetupComplete from '@/app/components/profile-setup/ProfileSetupComplete';
import { useRouter } from 'next/navigation';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  // Wizard state
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Personal Info
  const [info, setInfo] = useState<PersonalInfo>({
    gender: null,
    dateOfBirth: '',
    heightCm: '',
    weightKg: '',
  });
  const [step1Errors, setStep1Errors] = useState<
    Partial<Record<keyof PersonalInfo, string>>
  >({});

  // Step 2 — Activity Level
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);

  // Step 3 — Results
  const [goalMode, setGoalMode] = useState<GoalMode>('maintain');
  const [metrics, setMetrics] = useState<BMRResult | null>(null);
  const [macros, setMacros] = useState<MacroResult | null>(null);

  // -- check did user profile existed or not
  useEffect(() => {
    async function checkProfile() {
      if (isUserLoaded && user?.publicMetadata?.role === 'admin') {
        router.replace('/admin');
        return;
      }

      // prevent sending broken API, because clerk takes moment to initialize. 
      if (!userId) {
        return;
      }
      try {
        const token = await getToken();
        const profile = await UserProfileExists(userId, token);

        // If profile already exists, redirect directly to dashboard
        if (profile) {
          router.replace('/dashboard');
        }
      } catch (err) {
        // Profile does not exist yet; user can proceed with setup
        console.log("profile setup page:", err);
      }
    }

    checkProfile();
  }, [userId, user, isUserLoaded, getToken, router]);


  // ── Validation: Step 1 ─────────────────────────────────────
  const validateStep1 = useCallback((): boolean => {
    const errs: Partial<Record<keyof PersonalInfo, string>> = {};

    if (!info.gender) errs.gender = 'Please select a gender.';
    if (!info.dateOfBirth) {
      errs.dateOfBirth = 'Please enter your date of birth.';
    } else {
      const age = getAge(info.dateOfBirth);
      if (age < 10 || age > 120) errs.dateOfBirth = 'Please enter a valid date of birth.';
    }
    if (!info.heightCm || +info.heightCm < 50 || +info.heightCm > 250)
      errs.heightCm = 'Height must be between 50–250 cm.';
    if (!info.weightKg || +info.weightKg < 20 || +info.weightKg > 300)
      errs.weightKg = 'Weight must be between 20–300 kg.';

    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  }, [info]);

  // ── Go to Step 2 ──────────────────────────────────────────
  const handleGoNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  // ── Calculate & Go to Step 3 ──────────────────────────────
  const handleCalculate = () => {
    if (!activityLevel || !info.gender) return;

    const age = getAge(info.dateOfBirth);
    const result = calculateAllMetrics(
      +info.weightKg,
      +info.heightCm,
      age,
      info.gender,
      activityLevel
    );
    setMetrics(result);
    setMacros(calculateMacros(result.tdee, goalMode));
    setStep(3);
  };

  // ── Update macros when goal mode changes on Step 3 ────────
  const handleGoalChange = (goal: GoalMode) => {
    setGoalMode(goal);
    if (metrics) setMacros(calculateMacros(metrics.tdee, goal));
  };

  // ── Submit to Backend ──────────────────────────────────────
  const submitProfile = async () => {
    if (!metrics || !macros || !activityLevel || !info.gender) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken();

      await submitProfileApi(
        {
          userId: userId,
          gender: info.gender,
          dateOfBirth: info.dateOfBirth,
          heightCm: +info.heightCm,
          weightKg: +info.weightKg,
          activityLevel,
          goalMode,
          bmr: metrics.bmr,
          tdee: metrics.tdee,
          bmi: metrics.bmi,
          bmiCategory: metrics.bmiCategory,
          targetCalories: macros.targetCalories,
          targetProtein: macros.proteinG,
          targetFat: macros.fatG,
          targetCarbs: macros.carbsG,
        },
        token
      );

      // Trigger in-page celebration animation and redirect to dashboard
      setIsCompleted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render In-Page Completion Transition ──────────────────
  if (isCompleted) {
    return <ProfileSetupComplete />;
  }

  // ─────────────────────────────────────────────────────────
  // Render Main Wizard
  // ─────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* ── Top Bar ──────────────────────────────────────── */}
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥑</span>
          <span className="font-black text-lg text-text-primary tracking-tight">
            Cal<span className="text-mint-dark dark:text-mint">Pal</span>
          </span>

        </div>
        <div className="flex flex-col items-end gap-1">
          <StepDots current={step} />
          <span className="text-[11px] font-semibold text-[var(--text-tertiary)]">
            Step {step} of 3
          </span>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <Step1PersonalInfo
              info={info}
              setInfo={setInfo}
              errors={step1Errors}
              onNext={handleGoNext}
            />
          )}

          {step === 2 && (
            <Step2ActivityLevel
              activityLevel={activityLevel}
              onSelectActivity={setActivityLevel}
              onBack={() => setStep(1)}
              onCalculate={handleCalculate}
            />
          )}

          {step === 3 && metrics && macros && (
            <Step3Results
              metrics={metrics}
              macros={macros}
              goalMode={goalMode}
              isSubmitting={isSubmitting}
              error={error}
              onGoalChange={handleGoalChange}
              onBack={() => setStep(2)}
              onSubmit={submitProfile}
            />
          )}
        </div>
      </div>
    </main>
  );
}