import { ActivityCard } from '../types';
import { GoalMode } from '../calculations/macros';

// ─── Age Calculator ──────────────────────────────────────────
export function getAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// ─── Activity Level Config ───────────────────────────────────
export const ACTIVITY_CARDS: ActivityCard[] = [
  {
    level: 'sedentary',
    emoji: '🪑',
    title: 'Sedentary',
    subtitle: 'Little or no exercise',
    detail: 'Desk job, no structured workouts. You mostly sit throughout the day.',
  },
  {
    level: 'light',
    emoji: '🚶',
    title: 'Light',
    subtitle: 'Exercise 1–3 days/week',
    detail: 'Light walks, casual yoga, or weekend recreational activities.',
  },
  {
    level: 'moderate',
    emoji: '🏃',
    title: 'Moderate',
    subtitle: 'Exercise 4–5 days/week',
    detail: 'Regular gym sessions or cardio. Dedicated fitness routine.',
  },
  {
    level: 'active',
    emoji: '💪',
    title: 'Active',
    subtitle: 'Daily exercise',
    detail: 'You exercise every day — gym, sports, cycling, or intense cardio.',
  },
  {
    level: 'very_active',
    emoji: '🏋️',
    title: 'Very Active',
    subtitle: 'Intense 6–7 days/week',
    detail: 'Hard training most days. Serious athlete or physical training program.',
  }
];

// ─── Goal Mode Config ────────────────────────────────────────
export const GOAL_MODES: GoalMode[] = ['lose', 'maintain', 'gain'];
