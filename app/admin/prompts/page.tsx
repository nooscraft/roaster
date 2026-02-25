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

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/prompts/${id}/activate`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchPrompts();
      }
    } catch (error) {
      alert('Failed to activate prompt');
    }
  };

  return (
    <div>
      <h1 className="pixel-font text-3xl text-yellow-300 mb-6 glow-text">
        PROMPT MANAGEMENT
      </h1>

      <RetroCard variant="coral" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-yellow-300 font-bold text-xl">
            💬 Prompt Versions ({prompts.length})
          </h2>
          <RetroButton onClick={() => setShowForm(!showForm)}>
            {showForm ? 'CANCEL' : '+ NEW VERSION'}
          </RetroButton>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-black/30 border-2 border-cyan-400">
            <form className="space-y-4">
              <RetroInput
                label="Version Name"
                placeholder="roast-v2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <div>
                <label className="block text-cyan-300 mb-2 pixel-font text-xs">
                  System Prompt
                </label>
                <textarea
                  className="retro-input w-full h-32"
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-cyan-300 mb-2 pixel-font text-xs">
                  User Prompt Template
                </label>
                <textarea
                  className="retro-input w-full h-32"
                  placeholder="Use {{handle}}, {{excerpt}}, {{url}}, {{date}}, {{metrics}}"
                  value={formData.userPromptTemplate}
                  onChange={(e) => setFormData({ ...formData, userPromptTemplate: e.target.value })}
                />
              </div>
              <RetroButton type="submit">
                CREATE VERSION
              </RetroButton>
            </form>
          </div>
        )}
      </RetroCard>

      {loading ? (
        <RetroCard variant="yellow">
          <p className="text-cyan-300 text-center py-8">Loading...</p>
        </RetroCard>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <RetroCard key={prompt.id} variant={prompt.isActive ? 'pink' : 'cyan'}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-pink-400 font-bold text-xl mb-2">
                    {prompt.name}
                  </h3>
                  {prompt.isActive && <RetroBadge>✓ ACTIVE</RetroBadge>}
                </div>
                <div className="text-cyan-300 text-sm">
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-cyan-300 text-sm font-bold mb-2">System Prompt:</h4>
                <p className="text-white text-sm bg-black/30 p-3 border border-purple-600 max-h-32 overflow-y-auto">
                  {prompt.systemPrompt}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-cyan-300 text-sm font-bold mb-2">User Prompt Template:</h4>
                <p className="text-white text-sm bg-black/30 p-3 border border-purple-600 max-h-32 overflow-y-auto">
                  {prompt.userPromptTemplate}
                </p>
              </div>

              {!prompt.isActive && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleActivate(prompt.id)}
                    className="text-xs px-3 py-2 bg-green-700 hover:bg-green-600"
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
