import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="animate-scaleIn card border border-[var(--mint)]/20 shadow-xl bg-[var(--bg-card)] p-8 max-w-xs w-full flex flex-col items-center justify-center space-y-4 rounded-3xl text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--mint-light)]/40 flex items-center justify-center text-2xl animate-spin">
          🥑
        </div>
        <div className="font-extrabold text-lg text-[var(--text-primary)]">
          Completing sign in...
        </div>
        <div className="text-xs text-[var(--text-secondary)] font-medium">
          Please wait while we set up your session.
        </div>
        <AuthenticateWithRedirectCallback
          continueSignUpUrl="/profile-setup"
          signUpForceRedirectUrl="/profile-setup"
          signInForceRedirectUrl="/profile-setup"
        />
      </div>
    </div>
  );
}
