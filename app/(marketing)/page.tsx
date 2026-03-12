'use client';

import { useState, useEffect } from 'react';
import { RoastCard } from '@/components/RoastCard';
import { FunnyLoading } from '@/components/retro/FunnyLoading';

interface Roast {
  id: string;
  approvedAt?: string | null;
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

function getRoastOrderMs(roast: Roast): number {
  const referenceTime = roast.approvedAt ?? roast.post.publishedAt;
  const ms = new Date(referenceTime).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

const PAGE_SIZE = 6;

export default function Home() {
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [newestApprovedAt, setNewestApprovedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [handleFilter, setHandleFilter] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(10);

  useEffect(() => {
    fetchRoasts(1, true);
  }, []);

  const fetchRoasts = async (pageNum: number, replace: boolean) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        ...(handleFilter && { handle: handleFilter }),
        minScore: minScore.toString(),
        maxScore: maxScore.toString(),
        page: pageNum.toString(),
        limit: PAGE_SIZE.toString(),
      });
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();
      const incoming: Roast[] = data.roasts || [];
      if (replace) {
        const sorted = [...incoming].sort(
          (a, b) => getRoastOrderMs(b) - getRoastOrderMs(a)
        );
        setRoasts(sorted);
        setNewestApprovedAt(data.newestApprovedAt || null);
      } else {
        setRoasts((prev) => {
          const combined = [...prev, ...incoming];
          return combined.sort((a, b) => getRoastOrderMs(b) - getRoastOrderMs(a));
        });
      }
      const { total, pages } = data.pagination ?? {};
      setHasMore(pageNum < (pages ?? 1));
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch roasts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const applyFilters = () => {
    fetchRoasts(1, true);
  };

  const loadMore = () => {
    fetchRoasts(page + 1, false);
  };

  return (
    <div>
      {/* Title */}
      <div className="text-center mb-6 md:mb-10">
        <h1 className="pixel-font glow-text mb-2 md:mb-3" style={{ fontSize: 'clamp(16px, 4vw, 20px)', color: '#1a1a1a', lineHeight: 1.6 }}>
          FRESHLY FROTH&apos;D
        </h1>
        <p style={{ color: '#575757', fontFamily: 'VT323, monospace', fontSize: 'clamp(18px, 4.5vw, 24px)', lineHeight: 1.35 }}>
          Because someone has to hold the buzzword bucket — one post at a time
        </p>
        {newestApprovedAt && (
          <p style={{ color: '#4d4d4d', fontFamily: 'VT323, monospace', fontSize: 'clamp(16px, 4vw, 19px)', marginTop: '10px', lineHeight: 1.35 }}>
            {formatLastRoastLine(newestApprovedAt)}
          </p>
        )}
      </div>

      {/* Filters */}
      <div
        className="retro-card mb-10"
        style={!showFilters ? { padding: '12px 16px' } : undefined}
      >
        <div className={`flex flex-wrap items-center justify-between gap-3 ${showFilters ? 'mb-4' : ''}`}>
          <h2 className="pixel-font" style={{ fontSize: '11px', color: '#1a1a1a' }}>
            FILTERS
          </h2>
          <button
            type="button"
            className="retro-button"
            onClick={() => setShowFilters((prev) => !prev)}
            style={{ fontSize: '8px', padding: '7px 12px' }}
          >
            {showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}
          </button>
        </div>

        {!showFilters ? (
          <p className="filters-collapsed-text" style={{ color: '#666', fontFamily: 'VT323, monospace', fontSize: '17px', lineHeight: 1.2 }}>
            Filters are in witness protection. Expand if you&apos;re here to hunt repeat offenders and score inflation.
          </p>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="roast-label" style={{ fontSize: '9px', color: '#4d4d4d', marginBottom: '8px' }}>HANDLE</label>
                <input
                  className="retro-input"
                  placeholder="e.g. OpenAI"
                  value={handleFilter}
                  onChange={(e) => setHandleFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="roast-label" style={{ fontSize: '9px', color: '#4d4d4d', marginBottom: '8px' }}>MIN BUBBLE SCORE: {minScore}</label>
                <input
                  type="range" min="0" max="10" step="0.5"
                  value={minScore}
                  onChange={(e) => setMinScore(parseFloat(e.target.value))}
                  className="w-full mt-2"
                  style={{ accentColor: '#F5C518' }}
                />
              </div>
              <div>
                <label className="roast-label" style={{ fontSize: '9px', color: '#4d4d4d', marginBottom: '8px' }}>MAX BUBBLE SCORE: {maxScore}</label>
                <input
                  type="range" min="0" max="10" step="0.5"
                  value={maxScore}
                  onChange={(e) => setMaxScore(parseFloat(e.target.value))}
                  className="w-full mt-2"
                  style={{ accentColor: '#F5C518' }}
                />
              </div>
            </div>
            <div className="mt-6">
              <button className="retro-button" onClick={applyFilters}>
                APPLY FILTERS
              </button>
            </div>
          </>
        )}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="retro-card text-center py-12">
          <FunnyLoading text="LOADING ROASTS..." />
        </div>
      ) : roasts.length === 0 ? (
        <div className="retro-card text-center py-12">
          <p className="pixel-font mb-4" style={{ fontSize: '11px' }}>NO ROASTS YET</p>
          <p style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
            Run <code>npx tsx scripts/generate-roasts-now.ts</code> to generate some!
          </p>
        </div>
      ) : (
        <>
          <div className="feed-grid">
            {roasts.map((roast) => (
              <RoastCard key={roast.id} roast={roast} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button
                type="button"
                className="retro-button"
                onClick={loadMore}
                disabled={loadingMore}
                style={{ fontSize: '9px', padding: '10px 24px', opacity: loadingMore ? 0.7 : 1 }}
              >
                {loadingMore ? <FunnyLoading text="LOADING..." /> : 'LOAD MORE ROASTS →'}
              </button>
              <p style={{ fontFamily: 'VT323, monospace', fontSize: '15px', color: '#999', marginTop: '8px' }}>
                Showing {roasts.length} roasts. There&apos;s more where that came from.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
