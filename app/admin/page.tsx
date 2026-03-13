'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroBadge } from '@/components/retro/RetroBadge';

interface Stats {
  totalPosts: number;
  totalRoasts: number;
  pendingRoasts: number;
  pendingReports: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <div>
      <h1 className="pixel-font mb-6 glow-text" style={{ fontSize: '18px', color: '#1a1a1a' }}>
        DASHBOARD
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <RetroCard variant="yellow">
          <div className="text-center">
            <p className="pixel-font text-4xl font-bold mb-2" style={{ color: '#1a1a1a' }}>{stats?.totalPosts ?? '—'}</p>
            <p className="roast-label">Total Posts</p>
          </div>
        </RetroCard>

        <RetroCard variant="yellow">
          <div className="text-center">
            <p className="pixel-font text-4xl font-bold mb-2" style={{ color: '#1a1a1a' }}>{stats?.totalRoasts ?? '—'}</p>
            <p className="roast-label">Total Roasts</p>
          </div>
        </RetroCard>

        <RetroCard variant="yellow">
          <div className="text-center">
            <p className={`pixel-font text-4xl font-bold mb-2 ${(stats?.pendingRoasts ?? 0) > 0 ? 'blink' : ''}`} style={{ color: '#1a1a1a' }}>
              {stats?.pendingRoasts ?? '—'}
            </p>
            <p className="roast-label">Pending Roasts</p>
          </div>
        </RetroCard>

        <RetroCard variant="yellow">
          <div className="text-center">
            <p className="pixel-font text-4xl font-bold mb-2" style={{ color: '#c0392b' }}>{stats?.pendingReports ?? '—'}</p>
            <p className="roast-label">Pending Reports</p>
          </div>
        </RetroCard>
      </div>

      <RetroCard variant="yellow" className="mb-6">
        <h2 className="pixel-font font-bold mb-4" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          📡 System Status
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '18px' }}>Database</span>
            <RetroBadge>✓ CONNECTED</RetroBadge>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '18px' }}>X API</span>
            <RetroBadge>⚠ NOT CONFIGURED</RetroBadge>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '18px' }}>OpenAI API</span>
            <RetroBadge>⚠ NOT CONFIGURED</RetroBadge>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '18px' }}>Worker</span>
            <RetroBadge>⚠ NOT RUNNING</RetroBadge>
          </div>
        </div>
      </RetroCard>

      <RetroCard variant="yellow">
        <h2 className="pixel-font font-bold mb-4" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          🎯 Quick Actions
        </h2>
        <div className="space-y-3">
          <a href="/admin/roasts" className="admin-link">
            <span style={{ color: '#c0392b' }}>→</span> Review Pending Roasts
          </a>
          <a href="/admin/reports" className="admin-link">
            <span style={{ color: '#c0392b' }}>→</span> Review Reports
          </a>
          <a href="/admin/badges" className="admin-link">
            <span style={{ color: '#c0392b' }}>→</span> Manage Badges
          </a>
          <a href="/admin/handles" className="admin-link">
            <span style={{ color: '#c0392b' }}>→</span> Manage Handles
          </a>
          <a href="/admin/prompts" className="admin-link">
            <span style={{ color: '#c0392b' }}>→</span> Manage Prompts
          </a>
        </div>
      </RetroCard>
    </div>
  );
}
