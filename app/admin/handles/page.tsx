'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroButton } from '@/components/retro/RetroButton';
import { RetroInput } from '@/components/retro/RetroInput';
import { RetroTable } from '@/components/retro/RetroTable';
import { RetroBadge } from '@/components/retro/RetroBadge';

interface Source {
  id: string;
  handle: string;
  xUserId: string | null;
  enabled: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  _count?: {
    posts: number;
  };
}

export default function HandlesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHandle, setNewHandle] = useState('');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled' | 'pending'>('all');

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/admin/handles');
      const data = await res.json();
      setSources(data.sources || []);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim()) return;

    setAdding(true);
    try {
      const res = await fetch('/api/admin/handles/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: newHandle }),
      });

      if (res.ok) {
        setNewHandle('');
        fetchSources();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to add handle');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/admin/handles/${id}/toggle`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchSources();
      }
    } catch (error) {
      alert('Failed to toggle handle');
    }
  };

  const handleSync = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/handles/${id}/sync`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('Sync job enqueued!');
      }
    } catch (error) {
      alert('Failed to trigger sync');
    }
  };

  const handleDelete = async (id: string, handle: string) => {
    if (!confirm(`Delete handle @${handle}? This will also delete all associated posts and roasts.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/handles/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchSources();
      }
    } catch (error) {
      alert('Failed to delete handle');
    }
  };

  const filteredSources = sources.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'enabled') return s.enabled && s.xUserId;
    if (filter === 'disabled') return !s.enabled;
    if (filter === 'pending') return s.enabled && !s.xUserId;
    return true;
  });

  return (
    <div>
      <h1 className="pixel-font mb-6 glow-text" style={{ fontSize: '18px', color: '#1a1a1a' }}>
        HANDLE MANAGEMENT
      </h1>

      <RetroCard variant="yellow" className="mb-6">
        <h2 className="pixel-font mb-4" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          ➕ Add New Handle
        </h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <RetroInput
            placeholder="@username"
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            className="flex-1"
          />
          <RetroButton type="submit" disabled={adding}>
            {adding ? 'ADDING...' : 'ADD'}
          </RetroButton>
        </form>
      </RetroCard>

      <RetroCard variant="yellow">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="pixel-font" style={{ fontSize: '10px', color: '#1a1a1a' }}>
            📋 Handles ({filteredSources.length})
          </h2>
          <div className="flex gap-2">
            {(['all', 'enabled', 'pending', 'disabled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`admin-tab ${filter === f ? 'admin-tab--active' : 'admin-tab--inactive'}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="pixel-font text-center py-8" style={{ fontSize: '10px', color: '#888' }}>Loading...</p>
        ) : filteredSources.length === 0 ? (
          <p className="pixel-font text-center py-8" style={{ fontSize: '10px', color: '#888' }}>No handles found</p>
        ) : (
          <div className="overflow-x-auto">
            <RetroTable headers={['Handle', 'Status', 'Posts', 'Last Sync', 'Actions']}>
              {filteredSources.map((source) => (
                <tr key={source.id}>
                  <td><span className="roast-handle">@{source.handle}</span></td>
                  <td>
                    {source.enabled ? (
                      source.xUserId ? (
                        <RetroBadge>✓ ENABLED</RetroBadge>
                      ) : (
                        <RetroBadge>⚠ PENDING</RetroBadge>
                      )
                    ) : (
                      <RetroBadge>✗ DISABLED</RetroBadge>
                    )}
                  </td>
                  <td style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#1a1a1a' }}>{source._count?.posts || 0}</td>
                  <td style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#888' }}>
                    {source.lastSyncedAt
                      ? new Date(source.lastSyncedAt).toLocaleString()
                      : 'Never'}
                  </td>
                  <td>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleToggle(source.id, source.enabled)}
                        className="admin-action-btn admin-action-btn--primary"
                      >
                        {source.enabled ? 'DISABLE' : 'ENABLE'}
                      </button>
                      <button
                        onClick={() => handleSync(source.id)}
                        className="admin-action-btn admin-action-btn--primary"
                        disabled={!source.enabled}
                      >
                        SYNC
                      </button>
                      <button
                        onClick={() => handleDelete(source.id, source.handle)}
                        className="admin-action-btn admin-action-btn--danger"
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </RetroTable>
          </div>
        )}
      </RetroCard>
    </div>
  );
}
