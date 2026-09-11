'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@/app/lib/types';

/**
 * Updates a user's role across both Clerk metadata and PostgreSQL database
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
  const { sessionClaims, getToken } = await auth();

  // 1. Enforce Server-Side Admin Authorization
  if (sessionClaims?.metadata?.role !== 'admin') {
    return {
      success: false,
      error: 'Unauthorized: You must have an Admin role to perform this action.',
    };
  }

  if (!userId || (newRole !== 'admin' && newRole !== 'user')) {
    return {
      success: false,
      error: 'Invalid user ID or role specified.',
    };
  }

  try {
    // 2. Update Clerk Public Metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: newRole },
    });

    // 3. Update PostgreSQL Database via NestJS Backend
    const token = await getToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const dbResponse = await fetch(`${apiUrl}/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!dbResponse.ok) {
        console.warn(`NestJS user role sync returned status ${dbResponse.status}`);
      }
    } catch (dbErr: any) {
      console.error('Failed to sync user role to PostgreSQL database:', dbErr.message);
      // Non-fatal: Clerk webhook will also catch and sync if active
    }

    // 4. Revalidate Admin Dashboard Route
    revalidatePath('/admin');

    return {
      success: true,
      message: `User role successfully updated to "${newRole}".`,
    };
  } catch (err: any) {
    console.error('Failed to update user role:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while updating the role.',
    };
  }
}

/**
 * Legacy form action handler for backwards compatibility
 */
export async function setRole(formData: FormData) {
  const userId = formData.get('id') as string;
  const role = formData.get('role') as UserRole;
  return updateUserRole(userId, role);
}

/**
 * Removes custom role metadata, reverting user to default 'user'
 */
export async function removeRole(formData: FormData) {
  const userId = formData.get('id') as string;
  return updateUserRole(userId, 'user');
}

/**
 * Returns the currently signed-in user's role from session JWT claims
 */
export async function getLoggedInUserRole(): Promise<UserRole> {
  const { sessionClaims } = await auth();
  return (sessionClaims?.metadata?.role as UserRole) || 'user';
}