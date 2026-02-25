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
      <div className="text-center mb-8">
        <h2 className="text-4xl text-orange-500 pixel-font mb-4 glow-text">
          LATEST ROASTS
        </h2>
        <p className="text-yellow-400 text-lg">
          The freshest takes on AI corporate hype and buzzword theater
        </p>
      </div>

      <RetroCard variant="orange" className="mb-8">
        <h3 className="text-yellow-400 font-bold mb-4">🔍 FILTERS</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <RetroInput
            placeholder="Filter by @handle"
            value={handleFilter}
            onChange={(e) => setHandleFilter(e.target.value)}
          />
          <div>
            <label className="block text-orange-400 mb-2 text-sm">
              Min Score: {minScore}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-orange-400 mb-2 text-sm">
              Max Score: {maxScore}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={maxScore}
              onChange={(e) => setMaxScore(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-4">
          <RetroButton onClick={fetchRoasts}>APPLY FILTERS</RetroButton>
        </div>
      </RetroCard>

      {loading ? (
        <RetroCard variant="orange">
          <p className="text-orange-400 text-center py-8">Loading roasts...</p>
        </RetroCard>
      ) : roasts.length === 0 ? (
        <RetroCard variant="orange">
          <p className="text-orange-400 text-center py-8">
            No roasts found. Check back soon or adjust your filters!
          </p>
          <p className="text-yellow-400 text-center text-sm mt-4">
            💡 Tip: Add some X handles in the admin panel to start generating roasts
          </p>
        </RetroCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roasts.map((roast) => (
            <RoastCard key={roast.id} roast={roast} />
          ))}
        </div>
      )}
    </div>
  );
}
