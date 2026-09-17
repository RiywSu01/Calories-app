import { ProfilePayload } from '@/app/lib/types';
import { demoStore, isDemoMode } from './demoStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Submit user profile biometrics and calculated targets
 */
export async function submitProfileApi(payload: ProfilePayload, token: string | null): Promise<void> {
  if (isDemoMode()) {
    demoStore.saveProfile(payload);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      demoStore.saveProfile(payload);
    }
  } catch (err) {
    demoStore.saveProfile(payload);
  }
}

/**
 * Check if user profile is existing for user on /profile-setup
 */
export async function UserProfileExists(userId: string, token: string | null): Promise<boolean> {
  if (isDemoMode()) {
    return demoStore.hasProfile(userId);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok || response.status === 404) {
      return demoStore.hasProfile(userId);
    }

    return response.ok;
  } catch (err) {
    return demoStore.hasProfile(userId);
  }
}
