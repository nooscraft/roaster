'use client';

import { useState } from 'react';

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
    } catch {
      alert('Failed to submit handle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="pixel-font glow-text mb-2" style={{ fontSize: '18px', color: '#1a1a1a' }}>
          SUBMIT A HANDLE
        </h1>
        <p style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '20px' }}>
          Know a founder who thinks they're disrupting gravity? Drop the handle. We'll handle the rest.
        </p>
      </div>

      {submitted ? (
        <div className="retro-card text-center py-10">
          <p style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', color: '#27ae60', marginBottom: '16px' }}>
            ✓ SUBMISSION RECEIVED
          </p>
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#555', marginBottom: '24px' }}>
            Noted. Our roast algorithms are already rubbing their hands together. If it passes the vibe check, they're getting froth'd.
          </p>
          <button className="retro-button" onClick={() => setSubmitted(false)}>
            FEED US ANOTHER
          </button>
        </div>
      ) : (
        <div className="retro-card">
          <form onSubmit={handleSubmit}>
            {/* Handle input */}
            <div className="mb-5">
              <label className="roast-label">X HANDLE *</label>
              <input
                className="retro-input"
                placeholder="@username"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required
              />
            </div>

            {/* Context textarea */}
            <div className="mb-5">
              <label className="roast-label">WHY DO THEY DESERVE THIS? (OPTIONAL)</label>
              <textarea
                className="retro-input"
                style={{ height: '120px', resize: 'vertical' }}
                placeholder="Did they just post about 'leveraging AI synergies to 10x their paradigm shift'? Tell us everything."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            {/* Guidelines */}
            <div style={{
              background: '#F2ECD8',
              border: '2px solid #1a1a1a',
              borderLeft: '5px solid #F5C518',
              padding: '14px 16px',
              marginBottom: '24px',
            }}>
              <p className="roast-label mb-2">⚠ THE FINE PRINT</p>
              <ul style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#555', lineHeight: '1.6' }}>
                <li>• We roast the hype, not the human — buzzword theater only</li>
                <li>• Must be a public account (we're not stalkers)</li>
                <li>• Bonus points for AI founders who've said "AGI by next Tuesday"</li>
                <li>• No witch hunts — we're satirists, not supervillains</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="retro-button"
                disabled={submitting || !handle.trim()}
                style={{ opacity: submitting || !handle.trim() ? 0.5 : 1 }}
              >
                {submitting ? 'LOADING THE ROAST CANNON...' : 'NOMINATE FOR FROTH'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
