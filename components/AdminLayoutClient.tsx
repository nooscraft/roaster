'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroButton } from '@/components/retro/RetroButton';

export function AdminLayoutClient({
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
        <RetroCard variant="yellow" className="sticky top-4">
          <h2 className="pixel-font mb-4 text-center glow-text" style={{ fontSize: '10px', color: '#1a1a1a' }}>
            ADMIN PANEL
          </h2>

          {session?.user && (
            <div className="mb-6 pb-4" style={{ borderBottom: '2px solid #1a1a1a' }}>
              <p className="roast-label text-center mb-1">Logged in as</p>
              <p className="text-center truncate" style={{ color: '#1a1a1a', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
                {session.user.email}
              </p>
            </div>
          )}

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block admin-tab text-center ${isActive ? 'admin-tab--active' : 'admin-tab--inactive'}`}
                >
                  {item.icon} {item.label}
                </a>
              );
            })}
          </nav>

          <div className="mt-6 pt-4" style={{ borderTop: '2px solid #1a1a1a' }}>
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
