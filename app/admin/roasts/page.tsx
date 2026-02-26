'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroButton } from '@/components/retro/RetroButton';
import { RetroTable } from '@/components/retro/RetroTable';
import { RetroBadge } from '@/components/retro/RetroBadge';
import { BubbleScoreMeter } from '@/components/retro/BubbleScoreMeter';

interface Roast {
  id: string;
  status: string;
  bubbleScore: number;
  archetype: string;
  tags: string[];
  sections: any;
  createdAt: string;
  post: {
    textExcerpt: string;
    url: string;
    source: {
      handle: string;
    };
  };
}

export default function RoastsPage() {
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedRoast, setSelectedRoast] = useState<Roast | null>(null);

  useEffect(() => {
    fetchRoasts();
  }, [filter]);

  const fetchRoasts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/roasts?status=${filter}`);
      const data = await res.json();
      setRoasts(data.roasts || []);
    } catch (error) {
      console.error('Failed to fetch roasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/roasts/${id}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchRoasts();
        setSelectedRoast(null);
      }
    } catch (error) {
      alert('Failed to approve roast');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/roasts/${id}/reject`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchRoasts();
        setSelectedRoast(null);
      }
    } catch (error) {
      alert('Failed to reject roast');
    }
  };

  return (
    <div>
      <h1 className="pixel-font mb-6 glow-text" style={{ fontSize: '18px', color: '#1a1a1a' }}>
        ROAST MODERATION
      </h1>

      <div className="flex gap-2 mb-6">
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`admin-tab ${filter === f ? 'admin-tab--active' : 'admin-tab--inactive'}`}
          >
            {f === 'PENDING' ? `PENDING (${roasts.filter(r => r.status === 'PENDING').length})` : f}
          </button>
        ))}
      </div>

      {loading ? (
        <RetroCard variant="yellow">
          <p className="pixel-font text-center py-8" style={{ fontSize: '10px', color: '#888' }}>Loading...</p>
        </RetroCard>
      ) : roasts.length === 0 ? (
        <RetroCard variant="yellow">
          <p className="pixel-font text-center py-8" style={{ fontSize: '10px', color: '#888' }}>No roasts found</p>
        </RetroCard>
      ) : (
        <div className="grid gap-6">
          {roasts.map((roast) => (
            <RetroCard key={roast.id} variant="yellow">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-1 flex justify-center items-start">
                  <BubbleScoreMeter score={roast.bubbleScore} size="sm" />
                </div>

                <div className="md:col-span-3">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="roast-handle mb-2" style={{ cursor: 'default' }}>
                        @{roast.post.source.handle}
                      </span>
                      <RetroBadge>{roast.archetype}</RetroBadge>
                    </div>
                    <div className="flex gap-2">
                      {roast.tags.map((tag, i) => (
                        <span key={i} className="roast-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="roast-translation mb-3">
                    <p className="line-clamp-2" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                      {roast.post.textExcerpt}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="roast-label mb-1">Translation</p>
                    <p className="mb-2" style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#1a1a1a' }}>
                      {roast.sections.translation}
                    </p>
                    <p className="roast-label mb-1">Reality Check</p>
                    <p style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#1a1a1a' }}>
                      {roast.sections.realityCheck}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setSelectedRoast(roast)}
                      className="admin-action-btn admin-action-btn--primary"
                    >
                      VIEW DETAILS
                    </button>
                    {roast.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(roast.id)}
                          className="admin-action-btn admin-action-btn--success"
                        >
                          ✓ APPROVE
                        </button>
                        <button
                          onClick={() => handleReject(roast.id)}
                          className="admin-action-btn admin-action-btn--danger"
                        >
                          ✗ REJECT
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </RetroCard>
          ))}
        </div>
      )}

      {selectedRoast && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSelectedRoast(null)}
        >
          <RetroCard
            variant="yellow"
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <h2 className="pixel-font mb-4 glow-text" style={{ fontSize: '14px', color: '#1a1a1a' }}>
              ROAST DETAILS
            </h2>

            <div className="mb-4">
              <h3 className="roast-label mb-2">Original Post</h3>
              <p className="mb-2" style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#1a1a1a' }}>{selectedRoast.post.textExcerpt}</p>
              <a
                href={selectedRoast.post.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#c0392b', fontFamily: 'VT323, monospace', fontSize: '18px', textDecoration: 'underline' }}
              >
                View on X →
              </a>
            </div>

            <div className="mb-4">
              <h3 className="roast-label mb-2">Roast Content</h3>
              <div className="space-y-3">
                <div>
                  <p className="roast-label mb-1">Translation</p>
                  <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#1a1a1a' }}>{selectedRoast.sections.translation}</p>
                </div>
                <div>
                  <p className="roast-label mb-1">Reality Check</p>
                  <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#1a1a1a' }}>{selectedRoast.sections.realityCheck}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="roast-label mb-2">Score Breakdown</h3>
              <div className="space-y-2">
                {selectedRoast.sections.scoreBreakdown?.map((item: any, i: number) => (
                  <div key={i} className="roast-reality p-3">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="roast-label">{item.label}</strong>
                      <span className="roast-tag">{item.score}/10</span>
                    </div>
                    <p style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedRoast.sections.awardCandidate && (
              <div className="mb-4">
                <h3 className="roast-label mb-2">Award Candidate</h3>
                <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#1a1a1a' }}>{selectedRoast.sections.awardCandidate}</p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <RetroButton onClick={() => setSelectedRoast(null)}>
                CLOSE
              </RetroButton>
              {selectedRoast.status === 'PENDING' && (
                <>
                  <RetroButton onClick={() => handleApprove(selectedRoast.id)}>
                    ✓ APPROVE
                  </RetroButton>
                  <RetroButton onClick={() => handleReject(selectedRoast.id)}>
                    ✗ REJECT
                  </RetroButton>
                </>
              )}
            </div>
          </RetroCard>
        </div>
      )}
    </div>
  );
}
