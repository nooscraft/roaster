'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroButton } from '@/components/retro/RetroButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/roasts', label: 'Roasts', icon: '🔥' },
    { href: '/admin/handles', label: 'Handles', icon: '🎯' },
    { href: '/admin/reports', label: 'Reports', icon: '⚠️' },
    { href: '/admin/prompts', label: 'Prompts', icon: '💬' },
    { href: '/admin/optouts', label: 'Opt-outs', icon: '🚫' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <aside className="md:col-span-1">
        <RetroCard variant="pink" className="sticky top-4">
          <h2 className="pixel-font text-yellow-300 text-sm mb-4 text-center glow-text">
            ADMIN PANEL
          </h2>
          
          {session?.user && (
            <div className="mb-6 pb-4 border-b-2 border-cyan-400">
              <p className="text-cyan-300 text-xs text-center mb-1">Logged in as:</p>
              <p className="text-white text-sm text-center font-bold truncate">
                {session.user.email}
              </p>
            </div>
          )}

          <nav className="space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-pink-600 text-yellow-300 border-2 border-yellow-300'
                    : 'text-cyan-300 hover:bg-purple-800 border-2 border-transparent'
                }`}
              >
                {item.icon} {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t-2 border-cyan-400">
            <RetroButton
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-xs"
            >
              🚪 SIGN OUT
            </RetroButton>
          </div>
        </RetroCard>
      </aside>

      <main className="md:col-span-3">
        {children}
      </main>
    </div>
  );
}
