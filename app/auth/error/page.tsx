'use client';

import { useSearchParams } from 'next/navigation';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroButton } from '@/components/retro/RetroButton';
import { FunnyLoading } from '@/components/retro/FunnyLoading';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    AccessDenied: 'Your email is not in the admin allowlist.',
    Configuration: 'Server configuration error. Please contact support.',
    Default: 'An error occurred during authentication.',
  };

  const message = errorMessages[error || 'Default'] || errorMessages.Default;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <RetroCard variant="coral" className="max-w-md w-full">
        <h1 className="pixel-font text-2xl text-red-500 text-center mb-6 glow-text">
          ACCESS DENIED
        </h1>
        <p className="text-cyan-300 text-center mb-8">
          {message}
        </p>
        <div className="flex justify-center gap-4">
          <RetroButton onClick={() => window.location.href = '/'}>
            🏠 HOME
          </RetroButton>
        </div>
        <p className="text-yellow-300 text-xs text-center mt-6 pixel-font">
          ⚠ UNAUTHORIZED ACCESS ATTEMPT LOGGED ⚠
        </p>
      </RetroCard>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="text-center py-8"><FunnyLoading /></div>}>
      <ErrorContent />
    </Suspense>
  );
}
