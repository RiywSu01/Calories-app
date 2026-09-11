'use client';

import React, { useState, useTransition, useMemo } from 'react';
import {
  AdminUserSummary,
  AdminUserStats,
  UserRole,
} from '@/app/lib/types';
import { updateUserRole } from './_actions';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCheck,
  Search,
  X,
  Target,
  Flame,
  Activity,
  Calendar,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
  Scale,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';

interface AdminDashboardClientProps {
  initialUsers: AdminUserSummary[];
  stats: AdminUserStats;
  currentAdminId: string;
}

export default function AdminDashboardClient({
  initialUsers,
  stats,
  currentAdminId,
}: AdminDashboardClientProps) {
  const [users, setUsers] = useState<AdminUserSummary[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'goals'>('all');
  const [selectedUserForGoals, setSelectedUserForGoals] = useState<AdminUserSummary | null>(null);

  const [isPending, startTransition] = useTransition();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state if initialUsers changes
  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return users.filter((u) => {
      // Role Filter Tab
      if (roleFilter === 'admin' && u.role !== 'admin') return false;
      if (roleFilter === 'user' && u.role !== 'user') return false;
      if (roleFilter === 'goals' && !u.goals?.targetCalories) return false;

      // Search Query Filter
      if (!query) return true;

      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const userId = (u.userId || '').toLowerCase();

      return (
        fullName.includes(query) ||
        username.includes(query) ||
        email.includes(query) ||
        userId.includes(query)
      );
    });
  }, [users, searchQuery, roleFilter]);

  // Handle Role Change
  const handleRoleChange = async (userId: string, targetRole: UserRole) => {
    if (userId === currentAdminId && targetRole === 'user') {
      const confirmed = window.confirm(
        'Warning: You are about to remove your own Admin role. You will immediately lose access to this admin dashboard. Are you sure?'
      );
      if (!confirmed) return;
    }

    setLoadingUserId(userId);
    setFeedback(null);

    startTransition(async () => {
      const res = await updateUserRole(userId, targetRole);

      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.userId === userId ? { ...u, role: targetRole } : u))
        );
        setFeedback({
          type: 'success',
          message: res.message || `Role successfully updated to ${targetRole}.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update user role.',
        });
      }

      setLoadingUserId(null);
    });
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-mint-light/40 border-mint text-mint-dark'
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-mint-dark" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="p-4 sm:p-5 rounded-3xl bg-bg-card border border-border shadow-xs hover:border-mint/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
              Total Accounts
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-text-primary">
              {stats.totalUsers}
            </span>
            <span className="block text-[11px] font-semibold text-text-tertiary mt-0.5">
              Registered in CalPal
            </span>
          </div>
        </div>

        {/* Super Admins */}
        <div className="p-4 sm:p-5 rounded-3xl bg-bg-card border border-border shadow-xs hover:border-purple-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
              Super Admins
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
              {stats.totalAdmins}
            </span>
            <span className="block text-[11px] font-semibold text-text-tertiary mt-0.5">
              Full admin privileges
            </span>
          </div>
        </div>

        {/* Standard Clients */}
        <div className="p-4 sm:p-5 rounded-3xl bg-bg-card border border-border shadow-xs hover:border-mint/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
              Standard Users
            </span>
            <div className="w-8 h-8 rounded-xl bg-mint-light text-mint-dark flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-text-primary">
              {stats.totalClients}
            </span>
            <span className="block text-[11px] font-semibold text-text-tertiary mt-0.5">
              App clients
            </span>
          </div>
        </div>

        {/* Goals Configured */}
        <div className="p-4 sm:p-5 rounded-3xl bg-bg-card border border-border shadow-xs hover:border-amber-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
              Profiles Active
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats.profilesCompleted}
            </span>
            <span className="block text-[11px] font-semibold text-text-tertiary mt-0.5">
              {stats.totalUsers > 0
                ? `${Math.round((stats.profilesCompleted / stats.totalUsers) * 100)}% Setup Rate`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="p-4 sm:p-5 rounded-3xl bg-bg-card border border-border shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-bg-input border border-border focus:border-mint focus:outline-hidden text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-bg-input rounded-2xl overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-bg-card text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Admins ({stats.totalAdmins})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('user')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              roleFilter === 'user'
                ? 'bg-bg-card text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Users ({stats.totalClients})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('goals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              roleFilter === 'goals'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            With Goals ({stats.profilesCompleted})
          </button>
        </div>
      </div>

      {/* Users List (Table on Desktop, Cards on Mobile) */}
      <div className="bg-bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm sm:text-base text-text-primary">
              User Directory
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-bg-input text-text-tertiary">
              {filteredUsers.length} shown
            </span>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Search className="w-8 h-8 text-text-tertiary mx-auto opacity-50" />
            <h4 className="font-bold text-sm text-text-primary">No users found</h4>
            <p className="text-xs text-text-secondary">
              Try adjusting your search query or filter tab.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-input/40 text-[11px] font-extrabold uppercase tracking-wider text-text-tertiary">
                  <th className="py-3 px-4 sm:px-6">User / Account</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Daily Targets</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs sm:text-sm">
                {filteredUsers.map((user) => {
                  const isCurrentAdmin = user.userId === currentAdminId;
                  const isUserLoading = loadingUserId === user.userId;
                  const hasGoals = Boolean(user.goals?.targetCalories);

                  return (
                    <tr
                      key={user.userId}
                      className="hover:bg-bg-input/20 transition-colors group"
                    >
                      {/* Identity Column */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-bg-input shrink-0 border border-border">
                            {user.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-secondary font-black text-xs uppercase bg-mint-light/40 text-mint-dark">
                                {user.username.slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-text-primary truncate">
                                {user.firstName || user.lastName
                                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                  : user.username}
                              </span>
                              {isCurrentAdmin && (
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-mint-light text-mint-dark border border-mint/30">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-text-secondary block truncate">
                              {user.email}
                            </span>
                            <span className="text-[10px] text-text-tertiary font-mono block truncate">
                              {user.userId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge Column */}
                      <td className="py-4 px-4">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-extrabold text-xs">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bg-input border border-border text-text-secondary font-bold text-xs">
                            <UserCheck className="w-3.5 h-3.5 text-text-tertiary" />
                            <span>User</span>
                          </span>
                        )}
                      </td>

                      {/* Daily Goals Column */}
                      <td className="py-4 px-4">
                        {hasGoals && user.goals ? (
                          <button
                            type="button"
                            onClick={() => setSelectedUserForGoals(user)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-xs transition-all active:scale-95 cursor-pointer text-left"
                            title="Click to view full nutritional goals"
                          >
                            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            <span>{user.goals.targetCalories} kcal</span>
                            <span className="text-[10px] font-semibold text-text-tertiary">
                              • P:{user.goals.targetProtein}g
                            </span>
                            <ChevronRight className="w-3 h-3 text-text-tertiary" />
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-text-tertiary italic">
                            Profile Pending
                          </span>
                        )}
                      </td>

                      {/* Joined Date Column */}
                      <td className="py-4 px-4 text-xs text-text-secondary whitespace-nowrap">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Role Actions Column */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        {user.role === 'admin' ? (
                          <button
                            type="button"
                            disabled={isUserLoading || isPending}
                            onClick={() => handleRoleChange(user.userId, 'user')}
                            className="px-3 py-1.5 rounded-xl border border-border hover:border-red-400 hover:bg-red-500/10 text-text-secondary hover:text-red-600 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            {isUserLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                                <span>Demote to User</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isUserLoading || isPending}
                            onClick={() => handleRoleChange(user.userId, 'admin')}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            {isUserLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Make Admin</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Goals Inspector Modal */}
      {selectedUserForGoals && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="w-full max-w-lg bg-bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-text-primary">
                    {selectedUserForGoals.firstName || selectedUserForGoals.lastName
                      ? `${selectedUserForGoals.firstName || ''} ${selectedUserForGoals.lastName || ''}`.trim()
                      : selectedUserForGoals.username}
                  </h3>
                  <span className="text-xs text-text-secondary">
                    Dietary & Nutritional Profile Breakdown
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForGoals(null)}
                className="p-1.5 rounded-full hover:bg-bg-input text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Calories & Macro Targets */}
            {selectedUserForGoals.goals && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Daily Calorie Target
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
                    <span className="text-3xl font-black text-text-primary">
                      {selectedUserForGoals.goals.targetCalories || '—'}
                    </span>
                    <span className="text-xs font-bold text-text-secondary">kcal / day</span>
                  </div>
                  {selectedUserForGoals.goals.goalMode && (
                    <span className="inline-block mt-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-200">
                      Goal: {selectedUserForGoals.goals.goalMode} Weight
                    </span>
                  )}
                </div>

                {/* Macro Distribution Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Protein */}
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Protein
                    </span>
                    <span className="text-lg font-black text-text-primary">
                      {selectedUserForGoals.goals.targetProtein ?? '—'}g
                    </span>
                  </div>

                  {/* Carbs */}
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Carbs
                    </span>
                    <span className="text-lg font-black text-text-primary">
                      {selectedUserForGoals.goals.targetCarbs ?? '—'}g
                    </span>
                  </div>

                  {/* Fat */}
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Fat
                    </span>
                    <span className="text-lg font-black text-text-primary">
                      {selectedUserForGoals.goals.targetFat ?? '—'}g
                    </span>
                  </div>
                </div>

                {/* Metabolic & Biometric Stats */}
                <div className="p-4 rounded-2xl bg-bg-input/50 border border-border space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
                    Metabolic & Biometrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-text-tertiary block">BMR (Basal Rate)</span>
                      <span className="font-bold text-text-primary">
                        {selectedUserForGoals.goals.bmr
                          ? `${Math.round(selectedUserForGoals.goals.bmr)} kcal`
                          : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-tertiary block">TDEE (Daily Energy)</span>
                      <span className="font-bold text-text-primary">
                        {selectedUserForGoals.goals.tdee
                          ? `${Math.round(selectedUserForGoals.goals.tdee)} kcal`
                          : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-tertiary block">Body Mass Index (BMI)</span>
                      <span className="font-bold text-text-primary">
                        {selectedUserForGoals.goals.bmi || '—'}{' '}
                        {selectedUserForGoals.goals.bmiCategory && (
                          <span className="text-[10px] text-text-secondary font-normal">
                            ({selectedUserForGoals.goals.bmiCategory})
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-tertiary block">Activity Level</span>
                      <span className="font-bold text-text-primary capitalize">
                        {selectedUserForGoals.goals.activityLevel?.replace('_', ' ') || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-tertiary block">Height & Weight</span>
                      <span className="font-bold text-text-primary">
                        {selectedUserForGoals.goals.heightCm
                          ? `${selectedUserForGoals.goals.heightCm} cm`
                          : '—'}{' '}
                        •{' '}
                        {selectedUserForGoals.goals.weightKg
                          ? `${selectedUserForGoals.goals.weightKg} kg`
                          : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-tertiary block">Gender</span>
                      <span className="font-bold text-text-primary capitalize">
                        {selectedUserForGoals.goals.gender || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForGoals(null)}
                className="px-4 py-2.5 rounded-2xl bg-bg-input hover:bg-border text-text-primary font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
