'use client';

import { signIn } from 'next-auth/react';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroButton } from '@/components/retro/RetroButton';

export default function SignInPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <RetroCard variant="pink" className="max-w-md w-full">
        <h1 className="pixel-font text-2xl text-yellow-300 text-center mb-6 glow-text">
          ADMIN ACCESS
        </h1>
        <p className="text-cyan-300 text-center mb-8">
          Sign in with your authorized GitHub account to access the admin panel.
        </p>
        <div className="flex justify-center">
          <RetroButton onClick={() => signIn('github', { callbackUrl: '/admin' })}>
            🔐 SIGN IN WITH GITHUB
          </RetroButton>
        </div>
        <p className="text-yellow-300 text-xs text-center mt-6 pixel-font">
          ⚠ AUTHORIZED PERSONNEL ONLY ⚠
        </p>
      </RetroCard>
    </div>
  );
}
