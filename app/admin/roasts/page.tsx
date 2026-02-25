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
      <h1 className="pixel-font text-3xl text-yellow-300 mb-6 glow-text">
        ROAST MODERATION
      </h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 ${
            filter === 'PENDING' ? 'bg-pink-600' : 'bg-purple-800'
          }`}
        >
          PENDING ({roasts.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-4 py-2 ${
            filter === 'APPROVED' ? 'bg-pink-600' : 'bg-purple-800'
          }`}
        >
          APPROVED
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-4 py-2 ${
            filter === 'REJECTED' ? 'bg-pink-600' : 'bg-purple-800'
          }`}
        >
          REJECTED
        </button>
      </div>

      {loading ? (
        <RetroCard variant="yellow">
          <p className="text-cyan-300 text-center py-8">Loading...</p>
        </RetroCard>
      ) : roasts.length === 0 ? (
        <RetroCard variant="yellow">
          <p className="text-cyan-300 text-center py-8">No roasts found</p>
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
                      <h3 className="text-pink-400 font-bold text-xl mb-1">
                        @{roast.post.source.handle}
                      </h3>
                      <RetroBadge>{roast.archetype}</RetroBadge>
                    </div>
                    <div className="flex gap-2">
                      {roast.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-purple-800 text-cyan-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3 p-3 bg-black/30 border-2 border-purple-600">
                    <p className="text-white text-sm line-clamp-2">
                      {roast.post.textExcerpt}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-cyan-300 text-sm italic mb-2">
                      <strong>Translation:</strong> {roast.sections.translation}
                    </p>
                    <p className="text-yellow-300 text-sm">
                      <strong>Reality Check:</strong> {roast.sections.realityCheck}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setSelectedRoast(roast)}
                      className="text-xs px-3 py-2 bg-purple-800 hover:bg-purple-700"
                    >
                      VIEW DETAILS
                    </button>
                    {roast.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(roast.id)}
                          className="text-xs px-3 py-2 bg-green-700 hover:bg-green-600"
                        >
                          ✓ APPROVE
                        </button>
                        <button
                          onClick={() => handleReject(roast.id)}
                          className="text-xs px-3 py-2 bg-red-700 hover:bg-red-600"
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
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRoast(null)}
        >
          <RetroCard
            variant="coral"
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <h2 className="pixel-font text-2xl text-yellow-300 mb-4 glow-text">
              ROAST DETAILS
            </h2>

            <div className="mb-4">
              <h3 className="text-pink-400 font-bold mb-2">Original Post</h3>
              <p className="text-white mb-2">{selectedRoast.post.textExcerpt}</p>
              <a
                href={selectedRoast.post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 text-sm hover:text-cyan-200"
              >
                View on X →
              </a>
            </div>

            <div className="mb-4">
              <h3 className="text-pink-400 font-bold mb-2">Roast Content</h3>
              <div className="space-y-3">
                <div>
                  <strong className="text-cyan-300">Translation:</strong>
                  <p className="text-white">{selectedRoast.sections.translation}</p>
                </div>
                <div>
                  <strong className="text-cyan-300">Reality Check:</strong>
                  <p className="text-white">{selectedRoast.sections.realityCheck}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-pink-400 font-bold mb-2">Score Breakdown</h3>
              <div className="space-y-2">
                {selectedRoast.sections.scoreBreakdown?.map((item: any, i: number) => (
                  <div key={i} className="p-2 bg-black/30">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-cyan-300">{item.label}</strong>
                      <span className="text-yellow-300">{item.score}/10</span>
                    </div>
                    <p className="text-white text-sm">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedRoast.sections.awardCandidate && (
              <div className="mb-4">
                <h3 className="text-pink-400 font-bold mb-2">Award Candidate</h3>
                <p className="text-white">{selectedRoast.sections.awardCandidate}</p>
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
