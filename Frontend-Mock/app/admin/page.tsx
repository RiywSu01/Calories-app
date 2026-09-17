import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { AdminUserSummary, AdminUserStats, UserRole } from '@/app/lib/types';
import AdminDashboardClient from './AdminDashboardClient';
import ThemeToggle from '@/app/components/common/ThemeToggle';
import { ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { sessionClaims, userId: currentAdminId, getToken } = await auth();

  // 1. Strict Server-Side RBAC Guard (Admin Only)
  if (sessionClaims?.metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // 2. Fetch User Directory from Clerk
  const client = await clerkClient();
  const clerkUsersResponse = await client.users.getUserList({
    limit: 100,
    orderBy: '-created_at',
  });
  const clerkUsers = clerkUsersResponse.data || [];

  // 3. Fetch Database Profiles & Dietary Goals from NestJS
  const token = await getToken();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  let dbUsers: any[] = [];

  try {
    const dbRes = await fetch(`${apiUrl}/user`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    if (dbRes.ok) {
      const json = await dbRes.json();
      dbUsers = json.data || [];
    }
  } catch (err: any) {
    console.warn('Failed to fetch DB user profiles from NestJS:', err.message);
  }

  // Build a lookup map of DB user profiles by userId
  const dbUserMap = new Map<string, any>();
  dbUsers.forEach((u) => {
    dbUserMap.set(u.userId, u);
  });

  // 4. Merge Clerk Accounts with PostgreSQL Dietary Profiles
  const mergedUsers: AdminUserSummary[] = clerkUsers.map((clerkUser) => {
    const primaryEmail =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      'No email';

    const dbUser = dbUserMap.get(clerkUser.id);
    const profile = dbUser?.profile;

    const role: UserRole =
      (clerkUser.publicMetadata?.role as UserRole) ||
      (dbUser?.role as UserRole) ||
      'user';

    return {
      userId: clerkUser.id,
      email: primaryEmail,
      username:
        clerkUser.username ||
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
        primaryEmail.split('@')[0],
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role,
      createdAt: new Date(clerkUser.createdAt).toISOString(),
      lastSignInAt: clerkUser.lastSignInAt
        ? new Date(clerkUser.lastSignInAt).toISOString()
        : null,
      goals: profile
        ? {
            targetCalories: profile.targetCalories,
            targetProtein: profile.targetProtein,
            targetCarbs: profile.targetCarbs,
            targetFat: profile.targetFat,
            goalMode: profile.goalMode,
            activityLevel: profile.activityLevel,
            bmi: profile.bmi,
            bmiCategory: profile.bmiCategory,
            bmr: profile.bmr,
            tdee: profile.tdee,
            weightKg: profile.weightKg,
            heightCm: profile.heightCm,
            gender: profile.gender,
          }
        : null,
    };
  });

  // 5. Calculate Metrics & Stats
  const totalUsers = mergedUsers.length;
  const totalAdmins = mergedUsers.filter((u) => u.role === 'admin').length;
  const totalClients = mergedUsers.filter((u) => u.role === 'user').length;
  const profilesCompleted = mergedUsers.filter((u) => Boolean(u.goals?.targetCalories)).length;

  const stats: AdminUserStats = {
    totalUsers,
    totalAdmins,
    totalClients,
    profilesCompleted,
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Dedicated Admin Navbar (No dashboard links, Admin-exclusive) */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-bg-card/85 border-b border-border px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Admin Brand Badge */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl transform hover:scale-110 transition-transform select-none">
              🥑
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-text-primary leading-tight">
                  Cal<span className="text-mint-dark dark:text-mint">Pal</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Admin Console
                </span>
              </div>

              <span className="text-[10px] sm:text-xs font-bold text-text-tertiary">
                System Administration & Management
              </span>
            </div>
          </div>

          {/* Controls: Theme & UserButton */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold text-xs">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>Super Admin</span>
            </div>

            {/* Clerk User Button for Profile & Logout */}
            <div className="flex items-center p-0.5 rounded-full border border-border shadow-xs">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-8 h-8 rounded-full',
                    userButtonPopoverCard: 'shadow-2xl border border-border rounded-2xl',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Console Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Title Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary">
              User Management Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage user roles, inspect daily dietary goals, and monitor accounts across the platform
          </p>
        </div>

        {/* Client-Side Interactive Dashboard */}
        <AdminDashboardClient
          initialUsers={mergedUsers}
          stats={stats}
          currentAdminId={currentAdminId || ''}
        />
      </main>
    </div>
  );
}