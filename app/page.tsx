'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/retro/RetroCard';
import { RoastCard } from '@/components/RoastCard';
import { RetroInput } from '@/components/retro/RetroInput';
import { RetroButton } from '@/components/retro/RetroButton';

interface Roast {
  id: string;
  bubbleScore: number;
  archetype: string;
  tags: string[];
  sections: any;
  post: {
    source: {
      handle: string;
    };
    publishedAt: string;
  };
}

function formatRoastTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function formatLastRoastLine(iso: string): string {
  const d = new Date(iso);
  const diffHours = (Date.now() - d.getTime()) / 3600000;
  const timeStr = formatRoastTime(iso);
  const suffix = ' — from the LLM (Largely Luck-based Math)';
  if (diffHours < 2) {
    return `Last roast fresh out of the oven ${timeStr} — still warm${suffix}`;
  }
  return `Last roast batch ${timeStr}${suffix}`;
}

export default function Home() {
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [newestApprovedAt, setNewestApprovedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [handleFilter, setHandleFilter] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(10);

  useEffect(() => {
    fetchRoasts();
  }, []);

  const fetchRoasts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(handleFilter && { handle: handleFilter }),
        minScore: minScore.toString(),
        maxScore: maxScore.toString(),
      });
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();
      setRoasts(data.roasts || []);
      setNewestApprovedAt(data.newestApprovedAt || null);
    } catch (error) {
      console.error('Failed to fetch roasts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="pixel-font glow-text mb-2" style={{ fontSize: '20px', color: '#1a1a1a' }}>
          FRESHLY FROTH'D
        </h2>
        <p style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '20px' }}>
          Because someone has to hold the buzzword bucket — one post at a time
        </p>
        {newestApprovedAt && (
          <p style={{ color: '#666', fontFamily: 'VT323, monospace', fontSize: '16px', marginTop: '8px' }}>
            {formatLastRoastLine(newestApprovedAt)}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="retro-card mb-8">
        <h3 className="pixel-font mb-4" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          FILTERS
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="roast-label">HANDLE</label>
            <input
              className="retro-input"
              placeholder="e.g. OpenAI"
              value={handleFilter}
              onChange={(e) => setHandleFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="roast-label">MIN BUBBLE SCORE: {minScore}</label>
            <input
              type="range" min="0" max="10" step="0.5"
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              className="w-full mt-2"
              style={{ accentColor: '#F5C518' }}
            />
          </div>
          <div>
            <label className="roast-label">MAX BUBBLE SCORE: {maxScore}</label>
            <input
              type="range" min="0" max="10" step="0.5"
              value={maxScore}
              onChange={(e) => setMaxScore(parseFloat(e.target.value))}
              className="w-full mt-2"
              style={{ accentColor: '#F5C518' }}
            />
          </div>
        </div>
        <div className="mt-4">
          <button className="retro-button" onClick={fetchRoasts}>
            APPLY FILTERS
          </button>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="retro-card text-center py-12">
          <p className="pixel-font" style={{ fontSize: '10px' }}>LOADING ROASTS...</p>
        </div>
      ) : roasts.length === 0 ? (
        <div className="retro-card text-center py-12">
          <p className="pixel-font mb-4" style={{ fontSize: '10px' }}>NO ROASTS YET</p>
          <p style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
            Run <code>npx tsx scripts/generate-roasts-now.ts</code> to generate some!
          </p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {roasts.map((roast) => (
            <RoastCard key={roast.id} roast={roast} />
          ))}
        </div>
      )}
    </div>
  );
}
