'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/retro/RetroCard';
import { FunnyLoading } from '@/components/retro/FunnyLoading';
import Link from 'next/link';

interface Badge {
  id: string;
  handle: string;
  bubbleScore: number;
  roastText: string;
  bioText: string | null;
  createdAt: string;
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchHandle, setSearchHandle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/admin/badges');
      console.log('Badge fetch response status:', response.status);
      console.log('Badge fetch response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Badge data received:', data);
        setBadges(data.badges || []);
        setError(null);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Badge fetch error:', errorData);
        console.error('Response status:', response.status, response.statusText);
        setError(`Failed to load badges (${response.status}): ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      setError(`Failed to connect to server: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this badge? This cannot be undone.')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/badges/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBadges(badges.filter((b) => b.id !== id));
      } else {
        alert('Failed to delete badge');
      }
    } catch (error) {
      console.error('Failed to delete badge:', error);
      alert('Failed to delete badge');
    } finally {
      setDeleting(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 3) return '#22c55e';
    if (score < 6) return '#F5C518';
    if (score < 8) return '#f97316';
    return '#ef4444';
  };

  const filteredBadges = badges.filter((badge) =>
    badge.handle.toLowerCase().includes(searchHandle.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="pixel-font glow-text" style={{ fontSize: '18px', color: '#1a1a1a' }}>
          BADGE MANAGEMENT
        </h1>
        <Link href="/admin" className="retro-button" style={{ textDecoration: 'none', fontSize: '8px' }}>
          ← BACK
        </Link>
      </div>

      {/* Search */}
      <RetroCard variant="yellow" className="mb-6">
        <label className="roast-label" style={{ fontSize: '9px', marginBottom: '8px', display: 'block' }}>
          SEARCH BY HANDLE
        </label>
        <input
          type="text"
          className="retro-input"
          placeholder="Enter handle..."
          value={searchHandle}
          onChange={(e) => setSearchHandle(e.target.value)}
        />
      </RetroCard>

      {/* Stats */}
      <RetroCard variant="yellow" className="mb-6">
        <div className="flex gap-6">
          <div>
            <p className="pixel-font text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              {badges.length}
            </p>
            <p className="roast-label">Total Badges</p>
          </div>
          <div>
            <p className="pixel-font text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              {filteredBadges.length}
            </p>
            <p className="roast-label">Filtered Results</p>
          </div>
        </div>
      </RetroCard>

      {/* Error Message */}
      {error && (
        <RetroCard variant="yellow" className="mb-6">
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#c0392b', textAlign: 'center' }}>
            {error}
          </p>
        </RetroCard>
      )}

      {/* Badges List */}
      {loading ? (
        <div className="text-center py-12">
          <FunnyLoading text="Loading badges..." />
        </div>
      ) : filteredBadges.length === 0 ? (
        <RetroCard variant="yellow">
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#888', textAlign: 'center' }}>
            {searchHandle ? 'No badges found matching your search.' : 'No badges yet.'}
          </p>
        </RetroCard>
      ) : (
        <div className="space-y-4">
          {filteredBadges.map((badge) => (
            <RetroCard key={badge.id} variant="yellow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Badge Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <a
                      href={`https://x.com/${badge.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="roast-handle"
                      style={{ fontSize: '12px' }}
                    >
                      @{badge.handle}
                    </a>
                    <span
                      className="pixel-font"
                      style={{
                        fontSize: '16px',
                        color: getScoreColor(badge.bubbleScore),
                        fontWeight: 'bold',
                      }}
                    >
                      {badge.bubbleScore}/10
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: 'VT323, monospace',
                      fontSize: '16px',
                      color: '#666',
                      lineHeight: 1.4,
                      marginBottom: '8px',
                    }}
                  >
                    {badge.roastText}
                  </p>

                  {badge.bioText && (
                    <p
                      style={{
                        fontFamily: 'VT323, monospace',
                        fontSize: '14px',
                        color: '#999',
                        fontStyle: 'italic',
                      }}
                    >
                      Bio: "{badge.bioText.substring(0, 100)}
                      {badge.bioText.length > 100 ? '...' : ''}"
                    </p>
                  )}

                  <p
                    style={{
                      fontFamily: 'VT323, monospace',
                      fontSize: '14px',
                      color: '#999',
                      marginTop: '8px',
                    }}
                  >
                    Created: {new Date(badge.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={`/badge/${badge.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="retro-button"
                    style={{ textDecoration: 'none', fontSize: '8px', padding: '8px 12px' }}
                  >
                    VIEW
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(badge.id)}
                    disabled={deleting === badge.id}
                    className="retro-button"
                    style={{
                      fontSize: '8px',
                      padding: '8px 12px',
                      background: '#c0392b',
                      borderColor: '#c0392b',
                      color: '#fff',
                      opacity: deleting === badge.id ? 0.5 : 1,
                    }}
                  >
                    {deleting === badge.id ? 'DELETING...' : 'DELETE'}
                  </button>
                </div>
              </div>
            </RetroCard>
          ))}
        </div>
      )}
    </div>
  );
}
