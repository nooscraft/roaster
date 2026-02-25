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

export default function Home() {
  const [roasts, setRoasts] = useState<Roast[]>([]);
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
