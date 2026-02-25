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
          Suggest an X account that deserves the roast treatment
        </p>
      </div>

      {submitted ? (
        <div className="retro-card text-center py-10">
          <p style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', color: '#27ae60', marginBottom: '16px' }}>
            ✓ SUBMISSION RECEIVED
          </p>
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#555', marginBottom: '24px' }}>
            Thanks! We'll review and add it to our tracking list if approved.
          </p>
          <button className="retro-button" onClick={() => setSubmitted(false)}>
            SUBMIT ANOTHER
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
              <label className="roast-label">CONTEXT (OPTIONAL)</label>
              <textarea
                className="retro-input"
                style={{ height: '120px', resize: 'vertical' }}
                placeholder="Why should we track this handle? Any specific patterns or themes?"
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
              <p className="roast-label mb-2">⚠ GUIDELINES</p>
              <ul style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#555', lineHeight: '1.6' }}>
                <li>• We roast corporate hype and buzzword theater, not individuals</li>
                <li>• Suggested handles should be public accounts</li>
                <li>• Focus on AI/tech companies and thought leaders</li>
                <li>• No harassment or personal attacks</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="retro-button"
                disabled={submitting || !handle.trim()}
                style={{ opacity: submitting || !handle.trim() ? 0.5 : 1 }}
              >
                {submitting ? 'SUBMITTING...' : 'SUBMIT HANDLE'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
