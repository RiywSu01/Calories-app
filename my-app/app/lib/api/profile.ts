import { ProfilePayload } from '@/app/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * A POST request and attach Token, then pass to backend used on /profile-setup.
 * param: payload — Profile calculations and user stats
 * param: token   — Clerk authentication bearer token
 */
export async function submitProfileApi(payload: ProfilePayload, token: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string })?.message ??
      `Server error (${response.status})`
    );
  }
}

/**
 * Check if user profile is existing for user on /profile-setup
 **/
export async function UserProfileExists(userId: string, token: string | null): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok || response.status === 404) {
    return false;
  }

  return response.ok;
}
