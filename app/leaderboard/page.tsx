'use client';

import { useState, useEffect } from 'react';
import { BubbleScoreMeter } from '@/components/retro/BubbleScoreMeter';

interface LeaderboardEntry {
  category: string;
  roast: any;
  score: number;
}

const CATEGORIES = [
  { key: 'most_agentic',      icon: '🤖', label: 'Most Agentic' },
  { key: 'biggest_bubble',    icon: '🎈', label: 'Biggest Bubble' },
  { key: 'most_grounded',     icon: '⚓', label: 'Most Grounded' },
  { key: 'benchmark_theater', icon: '🎭', label: 'Benchmark Theater' },
  { key: 'stealth_mode',      icon: '🥷', label: 'Stealth Mode' },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((d) => setLeaderboard(d.leaderboard || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="pixel-font glow-text mb-2" style={{ fontSize: '18px', color: '#1a1a1a' }}>
          WEEKLY LEADERBOARD
        </h1>
        <p style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '20px' }}>
          This week's most notable achievements in AI hype
        </p>
      </div>

      {loading ? (
        <div className="retro-card text-center py-12">
          <p className="pixel-font" style={{ fontSize: '10px' }}>LOADING...</p>
        </div>
      ) : Object.keys(leaderboard).length === 0 ? (
        <div className="retro-card text-center py-12">
          <p className="pixel-font mb-3" style={{ fontSize: '10px' }}>NO AWARDS YET</p>
          <p style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
            Generate and approve some roasts to populate the leaderboard!
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {CATEGORIES.map(({ key, icon, label }) => {
            const entry = leaderboard[key];
            if (!entry) return null;

            const handle = entry.roast?.post?.source?.handle;
            const xUrl = `https://x.com/${handle}`;

            return (
              <div key={key} className="retro-card">
                <div className="grid md:grid-cols-4 gap-6">

                  {/* Left: icon + award name */}
                  <div className="flex flex-col items-center justify-center text-center border-r-2 border-black pr-4">
                    <div style={{ fontSize: '48px', lineHeight: 1 }}>{icon}</div>
                    <p className="pixel-font mt-3" style={{ fontSize: '8px', color: '#1a1a1a' }}>
                      {label}
                    </p>
                    <span className="retro-badge mt-3">
                      #{Math.round(entry.score * 10) / 10}
                    </span>
                  </div>

                  {/* Right: content */}
                  <div className="md:col-span-3">
                    {/* Handle + score */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <a
                          href={xUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="roast-handle"
                        >
                          @{handle}
                        </a>
                        <p className="mt-2" style={{
                          fontFamily: '"Press Start 2P", cursive',
                          fontSize: '10px',
                          color: '#c0392b',
                          lineHeight: '1.6',
                        }}>
                          {entry.roast.archetype}
                        </p>
                      </div>
                      <BubbleScoreMeter score={entry.roast.bubbleScore} size="sm" />
                    </div>

                    {/* Original post */}
                    {entry.roast.post?.textExcerpt && (
                      <div style={{
                        background: '#f9f9f9',
                        border: '2px solid #1a1a1a',
                        borderLeft: '5px solid #1a1a1a',
                        padding: '10px 12px',
                        marginBottom: '12px',
                        fontFamily: 'VT323, monospace',
                        fontSize: '16px',
                        color: '#333',
                      }}>
                        <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#888', display: 'block', marginBottom: '6px' }}>
                          ORIGINAL POST
                        </span>
                        "{entry.roast.post.textExcerpt.length > 180
                          ? entry.roast.post.textExcerpt.substring(0, 180) + '…'
                          : entry.roast.post.textExcerpt}"
                      </div>
                    )}

                    {/* Translation */}
                    <div className="roast-translation">
                      <span className="roast-label">WHAT THEY MEANT</span>
                      <p style={{ fontSize: '16px' }}>{entry.roast.sections?.translation}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end mt-4">
                      <a href={`/roast/${entry.roast.id}`} className="roast-view-btn">
                        FULL ROAST →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
