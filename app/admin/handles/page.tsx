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
      <h1 className="pixel-font text-3xl text-yellow-300 mb-6 glow-text">
        HANDLE MANAGEMENT
      </h1>

      <RetroCard variant="pink" className="mb-6">
        <h2 className="text-yellow-300 font-bold text-xl mb-4">
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

      <RetroCard variant="cyan">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-yellow-300 font-bold text-xl">
            📋 Handles ({filteredSources.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs ${
                filter === 'all' ? 'bg-pink-600' : 'bg-purple-800'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilter('enabled')}
              className={`px-3 py-1 text-xs ${
                filter === 'enabled' ? 'bg-pink-600' : 'bg-purple-800'
              }`}
            >
              ENABLED
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 text-xs ${
                filter === 'pending' ? 'bg-pink-600' : 'bg-purple-800'
              }`}
            >
              PENDING
            </button>
            <button
              onClick={() => setFilter('disabled')}
              className={`px-3 py-1 text-xs ${
                filter === 'disabled' ? 'bg-pink-600' : 'bg-purple-800'
              }`}
            >
              DISABLED
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-cyan-300 text-center py-8">Loading...</p>
        ) : filteredSources.length === 0 ? (
          <p className="text-cyan-300 text-center py-8">No handles found</p>
        ) : (
          <div className="overflow-x-auto">
            <RetroTable headers={['Handle', 'Status', 'Posts', 'Last Sync', 'Actions']}>
              {filteredSources.map((source) => (
                <tr key={source.id}>
                  <td className="font-bold text-pink-400">@{source.handle}</td>
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
                  <td className="text-cyan-300">{source._count?.posts || 0}</td>
                  <td className="text-cyan-300 text-sm">
                    {source.lastSyncedAt
                      ? new Date(source.lastSyncedAt).toLocaleString()
                      : 'Never'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(source.id, source.enabled)}
                        className="text-xs px-2 py-1 bg-purple-800 hover:bg-purple-700"
                      >
                        {source.enabled ? 'DISABLE' : 'ENABLE'}
                      </button>
                      <button
                        onClick={() => handleSync(source.id)}
                        className="text-xs px-2 py-1 bg-purple-800 hover:bg-purple-700"
                        disabled={!source.enabled}
                      >
                        SYNC
                      </button>
                      <button
                        onClick={() => handleDelete(source.id, source.handle)}
                        className="text-xs px-2 py-1 bg-red-800 hover:bg-red-700"
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
