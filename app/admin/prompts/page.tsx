'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroButton } from '@/components/retro/RetroButton';
import { RetroInput } from '@/components/retro/RetroInput';
import { RetroBadge } from '@/components/retro/RetroBadge';

interface PromptVersion {
  id: string;
  name: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isActive: boolean;
  createdAt: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
    userPromptTemplate: '',
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/admin/prompts');
      const data = await res.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleActivate = async (id: string) => {
    try {
      setCreateError(null);
      const res = await fetch(`/api/admin/prompts/${id}/activate`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchPrompts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to activate prompt');
      }
    } catch (error) {
      alert('Failed to activate prompt');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!formData.name.trim() || !formData.systemPrompt.trim() || !formData.userPromptTemplate.trim()) {
      setCreateError('Name, system prompt, and user prompt template are required.');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          systemPrompt: formData.systemPrompt.trim(),
          userPromptTemplate: formData.userPromptTemplate.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({ name: '', systemPrompt: '', userPromptTemplate: '' });
        setShowForm(false);
        fetchPrompts();
      } else {
        setCreateError(data.error || 'Failed to create prompt version');
      }
    } catch (error) {
      setCreateError('Failed to create prompt version');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h1 className="pixel-font mb-6 glow-text" style={{ fontSize: '18px', color: '#1a1a1a' }}>
        PROMPT MANAGEMENT
      </h1>

      <RetroCard variant="yellow" className="mb-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="pixel-font" style={{ fontSize: '10px', color: '#1a1a1a' }}>
            💬 Prompt Versions ({prompts.length})
          </h2>
          <RetroButton onClick={() => setShowForm(!showForm)}>
            {showForm ? 'CANCEL' : '+ NEW VERSION'}
          </RetroButton>
        </div>

        {showForm && (
          <div className="mb-6 p-4 retro-card" style={{ background: 'var(--cream)' }}>
            {createError && (
              <p className="mb-4 pixel-font text-sm" style={{ color: '#c0392b' }}>{createError}</p>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="roast-label">Version Name</label>
                <input
                  className="retro-input"
                  placeholder="roast-v2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="roast-label mb-2">
                  System Prompt
                </label>
                <textarea
                  className="retro-input w-full h-32"
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                />
              </div>
              <div>
                <label className="roast-label mb-2">
                  User Prompt Template
                </label>
                <textarea
                  className="retro-input w-full h-32"
                  placeholder="Use {{handle}}, {{excerpt}}, {{url}}, {{date}}, {{metrics}}"
                  value={formData.userPromptTemplate}
                  onChange={(e) => setFormData({ ...formData, userPromptTemplate: e.target.value })}
                />
              </div>
              <RetroButton type="submit" disabled={creating}>
                {creating ? 'CREATING...' : 'CREATE VERSION'}
              </RetroButton>
            </form>
          </div>
        )}
      </RetroCard>

      {loading ? (
        <RetroCard variant="yellow">
          <p className="pixel-font text-center py-8" style={{ fontSize: '10px', color: '#888' }}>Loading...</p>
        </RetroCard>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <RetroCard key={prompt.id} variant="yellow">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="pixel-font mb-2" style={{ fontSize: '10px', color: '#1a1a1a' }}>
                    {prompt.name}
                  </h3>
                  {prompt.isActive && <RetroBadge>✓ ACTIVE</RetroBadge>}
                </div>
                <div className="roast-label">
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="roast-label mb-2">System Prompt</h4>
                <pre className="roast-translation p-3 max-h-32 overflow-y-auto text-sm" style={{ whiteSpace: 'pre-wrap', fontFamily: 'VT323, monospace' }}>
                  {prompt.systemPrompt}
                </pre>
              </div>

              <div className="mb-4">
                <h4 className="roast-label mb-2">User Prompt Template</h4>
                <pre className="roast-reality p-3 max-h-32 overflow-y-auto text-sm" style={{ whiteSpace: 'pre-wrap', fontFamily: 'VT323, monospace' }}>
                  {prompt.userPromptTemplate}
                </pre>
              </div>

              {!prompt.isActive && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleActivate(prompt.id)}
                    className="admin-action-btn admin-action-btn--success"
                  >
                    ACTIVATE
                  </button>
                </div>
              )}
            </RetroCard>
          ))}
        </div>
      )}
    </div>
  );
}
