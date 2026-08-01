'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signup, getUser } from '../lib/storage';
import { calculateAllMetrics, ACTIVITY_LABELS } from '../lib/bmr';
import { ActivityLevel } from '../lib/types';
import ThemeToggle from '../components/ThemeToggle';

type View = 'login' | 'signup' | 'profile-setup';

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Profile setup fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      router.push('/dashboard');
    } else {
      const user = getUser();
      if (!user) {
        setError("No account found. Please sign up first!");
      } else {
        setError("Email doesn't match. Try again!");
      }
    }
  };

  const handleSignupNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setView('profile-setup');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!ageNum || !heightNum || !weightNum) {
      setError('Please fill in all fields');
      return;
    }

    const metrics = calculateAllMetrics(weightNum, heightNum, ageNum, gender, activity);

    signup({
      email,
      name,
      age: ageNum,
      gender,
      heightCm: heightNum,
      weightKg: weightNum,
      activityLevel: activity,
      dailyCalorieGoal: metrics.tdee,
    });

    router.push('/dashboard');
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px' }}>
      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="animate-scaleIn" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '56px', marginBottom: '8px' }}>🥑</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--mint)', margin: 0 }}>CalPal</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
          Your cute calorie buddy
        </p>
      </div>

      {/* ── Login View ── */}
      {view === 'login' && (
        <form onSubmit={handleLogin} className="animate-fadeIn stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-with-icon">
            <span className="input-icon">📧</span>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-with-icon">
            <span className="input-icon">🔒</span>
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ color: 'var(--peach)', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '8px' }}>
            Log In
          </button>

          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Don&apos;t have an account? </span>
            <button
              type="button"
              onClick={() => { setView('signup'); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--mint)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
                textDecoration: 'underline',
              }}
            >
              Sign Up
            </button>
          </div>
        </form>
      )}

      {/* ── Sign Up View ── */}
      {view === 'signup' && (
        <form onSubmit={handleSignupNext} className="animate-fadeIn stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-with-icon">
            <span className="input-icon">👤</span>
            <input
              className="input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-with-icon">
            <span className="input-icon">📧</span>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-with-icon">
            <span className="input-icon">🔒</span>
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ color: 'var(--peach)', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '8px' }}>
            Next — Set Up Profile ✨
          </button>

          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Already have an account? </span>
            <button
              type="button"
              onClick={() => { setView('login'); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--mint)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
                textDecoration: 'underline',
              }}
            >
              Log In
            </button>
          </div>
        </form>
      )}

      {/* ── Profile Setup View (BMR Calculator) ── */}
      {view === 'profile-setup' && (
        <form onSubmit={handleProfileSubmit} className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Let&apos;s get to know you 💪
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
              We&apos;ll calculate your daily calorie goal
            </p>
          </div>

          {/* Age & Gender row */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <span className="input-icon">🎂</span>
              <input
                className="input"
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={10}
                max={100}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid',
                    borderColor: gender === g ? 'var(--mint)' : 'var(--border)',
                    background: gender === g ? 'var(--mint-light)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {g === 'male' ? '👨' : '👩'}
                </button>
              ))}
            </div>
          </div>

          {/* Height & Weight row */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <span className="input-icon">📏</span>
              <input
                className="input"
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min={100}
                max={250}
                required
              />
            </div>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <span className="input-icon">⚖️</span>
              <input
                className="input"
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min={20}
                max={300}
                step={0.1}
                required
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              🏃 Activity Level
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className="input"
              style={{ cursor: 'pointer' }}
            >
              {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Preview BMR/BMI if all fields filled */}
          {age && height && weight && (
            <div className="animate-fadeIn card" style={{ background: 'var(--mint-light)', padding: '16px', textAlign: 'center' }}>
              {(() => {
                const metrics = calculateAllMetrics(
                  parseFloat(weight),
                  parseFloat(height),
                  parseInt(age),
                  gender,
                  activity
                );
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '22px', color: 'var(--mint)' }}>{metrics.tdee}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Daily Goal (cal)</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' }}>{metrics.bmr}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>BMR</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' }}>{metrics.bmi}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>BMI ({metrics.bmiCategory})</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {error && (
            <div style={{ color: 'var(--peach)', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full">
            Start Tracking! 🎉
          </button>

          <button
            type="button"
            onClick={() => setView('signup')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              textAlign: 'center',
            }}
          >
            ← Back
          </button>
        </form>
      )}
    </div>
  );
}
