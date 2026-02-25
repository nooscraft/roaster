'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroBadge } from '@/components/retro/RetroBadge';
import { BubbleScoreMeter } from '@/components/retro/BubbleScoreMeter';

interface LeaderboardEntry {
  category: string;
  roast: any;
  score: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data.leaderboard || {});
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'most_agentic', icon: '🤖', color: 'cyan' as const },
    { key: 'biggest_bubble', icon: '🎈', color: 'pink' as const },
    { key: 'most_grounded', icon: '⚓', color: 'yellow' as const },
    { key: 'benchmark_theater', icon: '🎭', color: 'cyan' as const },
    { key: 'stealth_mode', icon: '🥷', color: 'pink' as const },
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl text-yellow-300 pixel-font mb-4 glow-text">
          WEEKLY LEADERBOARD
        </h1>
        <p className="text-cyan-300 text-lg">
          This week's most notable achievements in AI hype
        </p>
      </div>

      {loading ? (
        <RetroCard variant="cyan">
          <p className="text-cyan-300 text-center py-8">Loading leaderboard...</p>
        </RetroCard>
      ) : Object.keys(leaderboard).length === 0 ? (
        <RetroCard variant="cyan">
          <p className="text-cyan-300 text-center py-8">
            No awards this week. Check back soon!
          </p>
        </RetroCard>
      ) : (
        <div className="grid gap-6">
          {categories.map(({ key, icon, color }) => {
            const entry = leaderboard[key];
            if (!entry) return null;

            return (
              <RetroCard key={key} variant={color}>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-1 flex flex-col items-center justify-center">
                    <div className="text-6xl mb-2">{icon}</div>
                    <h3 className="pixel-font text-yellow-300 text-sm text-center">
                      {entry.category}
                    </h3>
                  </div>

                  <div className="md:col-span-3">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-pink-400 font-bold text-2xl mb-2">
                          @{entry.roast.post.source.handle}
                        </h4>
                        <RetroBadge>{entry.roast.archetype}</RetroBadge>
                      </div>
                      <BubbleScoreMeter score={entry.roast.bubbleScore} size="sm" />
                    </div>

                    <div className="mb-4 p-3 bg-black/30 border-2 border-purple-600">
                      <p className="text-white text-sm line-clamp-2">
                        {entry.roast.post.textExcerpt}
                      </p>
                    </div>

                    <div className="mb-3">
                      <p className="text-cyan-300 text-sm italic">
                        {entry.roast.sections.translation}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-yellow-300 text-xs">
                        Score: {entry.score}
                      </p>
                      <a
                        href={`/roast/${entry.roast.id}`}
                        className="text-pink-400 hover:text-pink-300 text-sm font-bold"
                      >
                        VIEW FULL ROAST →
                      </a>
                    </div>
                  </div>
                </div>
              </RetroCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
