'use client';

import { useState } from 'react';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroInput } from '@/components/retro/RetroInput';
import { RetroButton } from '@/components/retro/RetroButton';

export default function SubmitPage() {
  const [handle, setHandle] = useState('');
  const [context, setContext] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/submit-handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, context }),
      });

      if (res.ok) {
        setSubmitted(true);
        setHandle('');
        setContext('');
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to submit handle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl text-yellow-300 pixel-font mb-4 glow-text">
          SUBMIT A HANDLE
        </h1>
        <p className="text-cyan-300 text-lg">
          Suggest an X account that deserves the roast treatment
        </p>
      </div>

      {submitted ? (
        <RetroCard variant="cyan">
          <div className="text-center py-8">
            <p className="text-green-400 text-2xl mb-4">✓ SUBMISSION RECEIVED</p>
            <p className="text-cyan-300 mb-6">
              Thanks for your suggestion! We'll review it and add it to our tracking list if approved.
            </p>
            <RetroButton onClick={() => setSubmitted(false)}>
              SUBMIT ANOTHER
            </RetroButton>
          </div>
        </RetroCard>
      ) : (
        <RetroCard variant="pink">
          <form onSubmit={handleSubmit}>
            <RetroInput
              label="X Handle *"
              placeholder="@username"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
            />

            <div className="mb-4">
              <label className="block text-cyan-300 mb-2 pixel-font text-xs">
                Context (Optional)
              </label>
              <textarea
                className="retro-input w-full h-32"
                placeholder="Why should we track this handle? Any specific patterns or themes?"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <div className="mb-6 p-4 bg-black/30 border-2 border-yellow-400">
              <p className="text-yellow-300 text-sm pixel-font mb-2">
                ⚠ GUIDELINES
              </p>
              <ul className="text-cyan-300 text-sm space-y-1">
                <li>• We roast corporate hype and buzzword theater, not individuals</li>
                <li>• Suggested handles should be public accounts</li>
                <li>• Focus on AI/tech companies and thought leaders</li>
                <li>• No harassment or personal attacks</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <RetroButton type="submit" disabled={submitting || !handle.trim()}>
                {submitting ? 'SUBMITTING...' : 'SUBMIT HANDLE'}
              </RetroButton>
            </div>
          </form>
        </RetroCard>
      )}
    </div>
  );
}
