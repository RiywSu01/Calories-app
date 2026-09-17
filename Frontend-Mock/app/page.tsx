'use client';

import { useState } from 'react';
import Link from 'next/link';
import CalorieRing from './components/common/CalorieRing';
import MacroBadge from './components/common/MacroBadge';
import { calculateAllMetrics, ACTIVITY_LABELS } from './lib/calculations/bmr';
import { ActivityLevel, BMRResult } from './lib/types';

export default function Home() {
  // Mini Interactive Calculator State
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [height, setHeight] = useState<number>(165);
  const [weight, setWeight] = useState<number>(60);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');

  // Calculated metrics state (calculated ONLY when button is clicked)
  const [calculatedMetrics, setCalculatedMetrics] = useState<BMRResult | null>(null);

  const handleCalculate = () => {
    setCalculatedMetrics(calculateAllMetrics(weight, height, age, gender, activity));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">


      {/* ── Main Content Container (Mobile First Container) ── */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-12 space-y-12 md:space-y-16">

        {/* ── 1. Hero Section ── */}
        <section className="text-center space-y-6 animate-fadeIn pt-2">
          {/* Cute Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--mint-light)]/40 text-[var(--text-primary)] border border-[var(--mint)]/30 animate-scaleIn">
            <span className="animate-bounce">🥑</span>
            <span>Your Friendly Calorie & Macro Companion</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
            Count Calories. <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-[var(--mint-dark)] via-[var(--mint)] to-[var(--peach)] bg-clip-text text-transparent">
              Balance Macros.
            </span> <br />
            Love What You Eat.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto font-medium leading-relaxed">
            CalPal makes daily calorie tracking cute, effortless, and tailored specifically to your body goals. AI food parsing, custom BMR targets, and smart macro guidance in your pocket.
          </p>

          {/* CTA Button Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/sign-up"
              className="btn btn-primary btn-full sm:btn-auto text-base !py-3.5 !px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Start Tracking Free ✨
            </Link>
            <a
              href="#calculator"
              className="btn btn-secondary btn-full sm:btn-auto text-base !py-3.5 !px-6 hover:bg-[var(--border)] transition-all"
            >
              Quick TDEE Calculator 📊
            </a>
          </div>

          {/* ── Interactive Hero Card Preview ── */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="card shadow-xl border border-[var(--border)] relative overflow-hidden bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-primary)]">
              {/* Card Header Badge */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">Today&apos;s Daily Log</span>
                </div>
                <span className="pill bg-[var(--mint-light)]/50 text-[var(--mint-dark)] font-bold text-xs">
                  Target: 2,100 kcal
                </span>
              </div>

              {/* Calorie Ring */}
              <div className="my-2">
                <CalorieRing consumed={1450} goal={2100} size={170} strokeWidth={14} />
              </div>

              {/* Macro Badges */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <MacroBadge label="Protein" value={110} unit="g" emoji="🥩" variant="protein" />
                <MacroBadge label="Carbs" value={180} unit="g" emoji="🌾" variant="carb" />
                <MacroBadge label="Fats" value={45} unit="g" emoji="🥑" variant="fat" />
              </div>

              {/* Sample Meals Preview */}
              <div className="mt-5 space-y-2 text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Logged Meals
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-input)] flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span>🥣</span>
                    <span>Avocado Toast & Boiled Egg</span>
                  </div>
                  <span className="font-extrabold text-[var(--mint-dark)] dark:text-[var(--mint)]">380 kcal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-input)] flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span>🥗</span>
                    <span>Grilled Salmon Quinoa Bowl</span>
                  </div>
                  <span className="font-extrabold text-[var(--mint-dark)] dark:text-[var(--mint)]">620 kcal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-input)] flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span>🍓</span>
                    <span>Greek Yogurt & Berries</span>
                  </div>
                  <span className="font-extrabold text-[var(--mint-dark)] dark:text-[var(--mint)]">220 kcal</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── 2. Interactive TDEE/BMR Quick Calculator Widget ── */}
        <section id="calculator" className="scroll-mt-20">
          <div className="card border border-[var(--mint)]/30 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--mint-light)]/20 shadow-lg">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[var(--mint)]/20 text-[var(--mint-dark)] dark:text-[var(--mint)]">
                ⚡ Instant Live Estimator
              </div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">
                Calculate Your Daily Calorie Need
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                See your scientific BMR & TDEE based on the Mifflin-St Jeor equation.
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender selector */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${gender === 'female'
                      ? 'border-[var(--mint)] bg-[var(--mint-light)]/30 text-[var(--text-primary)]'
                      : 'border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-secondary)]'
                      }`}
                  >
                    <span>👩</span> Female
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${gender === 'male'
                      ? 'border-[var(--mint)] bg-[var(--mint-light)]/30 text-[var(--text-primary)]'
                      : 'border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-secondary)]'
                      }`}
                  >
                    <span>👨</span> Male
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  🎂 Age (years)
                </label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={age || ''}
                  onChange={(e) => setAge(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="e.g. 25"
                  className="input font-semibold text-sm"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  📏 Height (cm)
                </label>
                <input
                  type="number"
                  min={50}
                  max={250}
                  value={height || ''}
                  onChange={(e) => setHeight(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="e.g. 165"
                  className="input font-semibold text-sm"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  ⚖️ Weight (kg)
                </label>
                <input
                  type="number"
                  min={20}
                  max={300}
                  step="any"
                  value={weight || ''}
                  onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="e.g. 60"
                  className="input font-semibold text-sm"
                />
              </div>

              {/* Activity Level */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  Activity Level
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                  className="input !py-2.5 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculate Trigger Button */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleCalculate}
                className="btn btn-primary text-sm !py-3 !px-6 shadow-md hover:shadow-lg transition-all cursor-pointer font-black w-full sm:w-auto"
              >
                Click Here to start calculate ✨
              </button>
            </div>

            {/* Metric Results Card (Shown after calculation) */}
            {calculatedMetrics ? (
              <div className="mt-5 p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--mint)]/30 text-center grid grid-cols-3 gap-2 animate-fadeIn">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[var(--mint-dark)] dark:text-[var(--mint)]">
                    {calculatedMetrics.tdee}
                  </div>
                  <div className="text-[11px] font-bold text-[var(--text-secondary)]">Daily TDEE (cal)</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    {calculatedMetrics.bmr}
                  </div>
                  <div className="text-[11px] font-bold text-[var(--text-secondary)]">BMR (cal)</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    {calculatedMetrics.bmi}
                  </div>
                  <div className="text-[11px] font-bold text-[var(--text-secondary)]">
                    BMI ({calculatedMetrics.bmiCategory})
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center text-xs font-semibold text-[var(--text-tertiary)] italic">
                👆 Fill in your details above and press the button to calculate your BMR & TDEE.
              </div>
            )}
          </div>
        </section>


        {/* ── 3. App Features Preview ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Everything You Need to Succeed 🎯
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Smart tools built to help you understand your body without restrictive diets or complex spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Feature 1 */}
            <div className="card card-interactive border border-[var(--border)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--mint-light)]/40 flex items-center justify-center text-2xl">
                📸
              </div>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">
                AI Food Scanner & Snap
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Take a quick photo of your plate or search thousands of foods. Our smart AI extracts estimated calories and macronutrient ratios instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card card-interactive border border-[var(--border)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--peach-light)]/40 flex items-center justify-center text-2xl">
                🧬
              </div>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">
                Scientifically Calculated Goals
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Uses the Mifflin-St Jeor formula to determine your exact Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card card-interactive border border-[var(--border)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--lavender-light)]/40 flex items-center justify-center text-2xl">
                📊
              </div>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">
                Visual Macro Balance
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Keep an eye on Protein, Carbs, and Fats with cute color-coded macro badges so your body gets proper fuel every day.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card card-interactive border border-[var(--border)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--mint-light)]/40 flex items-center justify-center text-2xl">
                📅
              </div>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">
                Weekly History & Calendar
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Easily toggle back and forth between days with the interactive week calendar component to track your consistency over time.
              </p>
            </div>
          </div>
        </section>


        {/* ── 4. Explain / How It Works ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              How CalPal Works 🥑
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              3 simple steps to start reaching your daily health targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="card border border-[var(--border)] text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[var(--mint)] text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                Set Your Profile 🎯
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Tell us your age, gender, height, weight, and activity level. CalPal computes your personal daily target.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card border border-[var(--border)] text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[var(--peach)] text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                Log Meals & Snacks 🥗
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Snap food photos with AI analysis or search our library to add meals into Breakfast, Lunch, and Dinner.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card border border-[var(--border)] text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[var(--lavender)] text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                Hit Your Ring Goal 🎉
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Watch your dynamic calorie ring complete in real-time as you stay mindful and balanced throughout the day!
              </p>
            </div>
          </div>
        </section>


        {/* ── 5. Cute User Testimonials ── */}
        <section className="card bg-gradient-to-br from-[var(--bg-card)] to-[var(--mint-light)]/20 border border-[var(--border)] space-y-4 text-center">
          <div className="space-y-1">
            <div className="text-amber-400 text-lg">⭐⭐⭐⭐⭐</div>
            <h3 className="font-extrabold text-lg text-[var(--text-primary)]">
              Loved by Foodies & Fitness Enthusiasts
            </h3>
          </div>
          <blockquote className="text-xs sm:text-sm text-[var(--text-secondary)] italic max-w-lg mx-auto">
            &ldquo;CalPal is by far the cutest and easiest calorie tracker I&apos;ve used. The live BMR calculator and macro ring keep me motivated without feeling overwhelmed!&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-xl">👩‍💻</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">Sarah M. — Daily CalPal User</span>
          </div>
        </section>


        {/* ── 6. Bottom Call To Action ── */}
        <section className="text-center space-y-4 py-4">
          <div className="text-4xl animate-bounce">🥑</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            Ready to meet your new health pal?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Join CalPal today and start your journey towards effortless calorie & macro balance.
          </p>
          <div className="pt-2">
            <Link
              href="sign-up"
              className="btn btn-primary text-base !py-3.5 !px-8 shadow-xl hover:shadow-2xl transition-all"
            >
              Get Started Now — It&apos;s Free! ✨
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] py-8 px-4 text-center text-xs text-[var(--text-tertiary)]">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 font-bold text-[var(--mint-dark)] dark:text-[var(--mint)]">
            <span>🥑</span>
            <span>CalPal — Made with 💚 for your health journey</span>
          </div>
          <div className="flex justify-center gap-4 text-[var(--text-secondary)] font-medium">
            <Link href="/sign-in" className="hover:underline">Login</Link>
            <Link href="/admin" className="hover:underline">Admin</Link>
            <Link href="/add-food" className="hover:underline">Add Food</Link>
          </div>
          <div>
            &copy; {new Date().getFullYear()} CalPal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
