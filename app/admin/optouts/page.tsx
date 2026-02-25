'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroButton } from '@/components/retro/RetroButton';
import { RetroInput } from '@/components/retro/RetroInput';
import { RetroTable } from '@/components/retro/RetroTable';

interface OptOut {
  id: string;
  matchType: string;
  value: string;
  createdAt: string;
}

export default function OptOutsPage() {
  const [optOuts, setOptOuts] = useState<OptOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchType, setMatchType] = useState<'HANDLE' | 'URL_PREFIX'>('HANDLE');
  const [value, setValue] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchOptOuts();
  }, []);

  const fetchOptOuts = async () => {
    try {
      const res = await fetch('/api/admin/optouts');
      const data = await res.json();
      setOptOuts(data.optOuts || []);
    } catch (error) {
      console.error('Failed to fetch opt-outs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    setAdding(true);
    try {
      const res = await fetch('/api/admin/optouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchType, value }),
      });

      if (res.ok) {
        setValue('');
        fetchOptOuts();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to add opt-out');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this opt-out entry?')) return;

    try {
      const res = await fetch(`/api/admin/optouts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchOptOuts();
      }
    } catch (error) {
      alert('Failed to delete opt-out');
    }
  };

  return (
    <div>
      <h1 className="pixel-font text-3xl text-yellow-300 mb-6 glow-text">
        OPT-OUT MANAGEMENT
      </h1>

      <RetroCard variant="coral" className="mb-6">
        <h2 className="text-yellow-300 font-bold text-xl mb-4">
          ➕ Add Opt-Out Entry
        </h2>
        <form onSubmit={handleAdd}>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-cyan-300 mb-2 text-sm">
                Match Type
              </label>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value as any)}
                className="retro-input w-full"
              >
                <option value="HANDLE">Handle</option>
                <option value="URL_PREFIX">URL Prefix</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <RetroInput
                label="Value"
                placeholder={
                  matchType === 'HANDLE'
                    ? 'username (without @)'
                    : 'https://twitter.com/username'
                }
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>
          <RetroButton type="submit" disabled={adding}>
            {adding ? 'ADDING...' : 'ADD OPT-OUT'}
          </RetroButton>
        </form>
      </RetroCard>

      <RetroCard variant="yellow">
        <h2 className="text-yellow-300 font-bold text-xl mb-4">
          📋 Opt-Out List ({optOuts.length})
        </h2>

        {loading ? (
          <p className="text-cyan-300 text-center py-8">Loading...</p>
        ) : optOuts.length === 0 ? (
          <p className="text-cyan-300 text-center py-8">No opt-outs configured</p>
        ) : (
          <div className="overflow-x-auto">
            <RetroTable headers={['Type', 'Value', 'Added', 'Actions']}>
              {optOuts.map((optOut) => (
                <tr key={optOut.id}>
                  <td className="text-pink-400">{optOut.matchType}</td>
                  <td className="text-cyan-300 font-mono">{optOut.value}</td>
                  <td className="text-cyan-300 text-sm">
                    {new Date(optOut.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(optOut.id)}
                      className="text-xs px-2 py-1 bg-red-800 hover:bg-red-700"
                    >
                      DELETE
                    </button>
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
