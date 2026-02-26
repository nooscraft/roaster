'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const REASONS = [
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'INACCURATE', label: 'Inaccurate / Misleading' },
  { value: 'TOO_PERSONAL', label: 'Too personal' },
  { value: 'OTHER', label: 'Other' },
] as const;

function ReportForm() {
  const searchParams = useSearchParams();
  const roastId = searchParams.get('roastId');

  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roast, setRoast] = useState<{ archetype: string; handle: string } | null>(null);

  useEffect(() => {
    if (roastId) {
      fetch(`/api/roasts/${roastId}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => data && setRoast({ archetype: data.archetype, handle: data.handle }))
        .catch(() => {});
    }
  }, [roastId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roastId || !reason) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roastId, reason, details: details || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit report');
      }
    } catch {
      setError('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!roastId) {
    return (
      <div className="retro-card text-center py-12">
        <p style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', color: '#c0392b', marginBottom: '16px' }}>
          SUSSY BUT NO ROAST
        </p>
        <p style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#555', marginBottom: '24px' }}>
          Can't report thin air. Hit the Report button on the roast you're side-eyeing.
        </p>
        <a href="/" className="retro-button">
          ← BACK TO FEED
        </a>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="retro-card text-center py-10">
        <p style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', color: '#27ae60', marginBottom: '16px' }}>
          ✓ SNITCH LOGGED
        </p>
        <p style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#555', marginBottom: '24px' }}>
          Alright, we got it. We'll give it the ol' side-eye and see what's up.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href={`/roast/${roastId}`} className="retro-button">
            VIEW ROAST
          </a>
          <a href="/" className="retro-button">
            BACK TO FEED
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-card">
      <form onSubmit={handleSubmit}>
        {roast && (
          <div style={{
            background: '#f9f9f9',
            border: '2px solid #1a1a1a',
            padding: '12px 16px',
            marginBottom: '24px',
          }}>
            <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#888' }}>YOU'RE CALLING OUT</span>
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#333', marginTop: '4px' }}>
              {roast.archetype} — @{roast.handle}
            </p>
          </div>
        )}

        <div className="mb-5">
          <label className="roast-label">REASON *</label>
          <select
            className="retro-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <option value="">What's the vibe?</option>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="roast-label">DETAILS (OPTIONAL)</label>
          <textarea
            className="retro-input"
            style={{ height: '100px', resize: 'vertical' }}
            placeholder="Got receipts? Spill the tea."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: '#c0392b', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="retro-button"
            disabled={submitting || !reason}
            style={{ opacity: submitting || !reason ? 0.5 : 1 }}
          >
            {submitting ? 'SNITCHING...' : 'SEND IT'}
          </button>
          <a href={`/roast/${roastId}`} className="retro-button" style={{ background: '#888', color: '#fff' }}>
            NEVER MIND
          </a>
        </div>
      </form>
    </div>
  );
}

export default function ReportPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="pixel-font glow-text mb-2" style={{ fontSize: '18px', color: '#1a1a1a' }}>
          OH COME ON NOW
        </h1>
        <p style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '20px' }}>
          Don't be such a sussy. Something rub you the wrong way? Snitch on it here — we'll have a look.
        </p>
      </div>

      <a href="/" className="retro-button inline-block mb-6" style={{ fontSize: '9px', padding: '8px 16px' }}>
        ← BACK TO FEED
      </a>

      <Suspense fallback={
        <div className="retro-card text-center py-12">
          <p className="pixel-font" style={{ fontSize: '10px' }}>LOADING...</p>
        </div>
      }>
        <ReportForm />
      </Suspense>
    </div>
  );
}
