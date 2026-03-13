'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FunnyLoading } from '@/components/retro/FunnyLoading';

const LOADING_MESSAGES = [
  'Fetching their timeline...',
  'Analyzing bio for buzzwords...',
  'Calculating delusion density...',
  'Measuring agentic energy...',
  'Checking for paradigm shifts...',
  'Scanning for stealth mode vibes...',
];

export default function BadgePage() {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let cleanHandle = handle.trim();
    if (!cleanHandle) {
      setError('Please enter a handle');
      return;
    }

    // Extract handle from X URL if provided
    // Supports: https://x.com/handle, https://twitter.com/handle, x.com/handle, @handle, or just handle
    const urlMatch = cleanHandle.match(/(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([^\/\?]+)/i);
    if (urlMatch) {
      cleanHandle = urlMatch[1];
    }
    // Remove @ if present
    cleanHandle = cleanHandle.replace(/^@/, '');

    if (!cleanHandle) {
      setError('Please enter a valid handle');
      return;
    }

    setLoading(true);

    // Cycle through loading messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2000);

    try {
      const response = await fetch('/api/badge/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: cleanHandle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze handle');
      }

      clearInterval(messageInterval);
      router.push(`/badge/${data.id}`);
    } catch (err: any) {
      clearInterval(messageInterval);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1
          className="pixel-font glow-text mb-3"
          style={{ fontSize: 'clamp(18px, 5vw, 24px)', color: '#1a1a1a', lineHeight: 1.6 }}
        >
          GET YOUR BUBBLE SCORE
        </h1>
        <p
          style={{
            color: '#666',
            fontFamily: 'VT323, monospace',
            fontSize: 'clamp(20px, 5vw, 24px)',
            lineHeight: 1.4,
            marginBottom: '12px',
          }}
        >
          Drop any X handle — yours, a friend's, or that VC you've been side-eyeing. We'll read their bio, scan their posts, and roast accordingly.
        </p>
        <p
          style={{
            color: '#999',
            fontFamily: 'VT323, monospace',
            fontSize: 'clamp(16px, 4vw, 20px)',
            lineHeight: 1.3,
          }}
        >
          Enter handle. Watch someone get destroyed. Share badge. Repeat.
        </p>
      </div>

      {/* Form */}
      <div className="retro-card">
        <form onSubmit={handleSubmit}>
          <label
            className="roast-label"
            style={{ fontSize: '10px', color: '#1a1a1a', marginBottom: '12px', display: 'block' }}
          >
            HANDLE TO ROAST (yours, a friend's, whoever deserves it)
          </label>
          <input
            type="text"
            className="retro-input"
            placeholder="e.g. elonmusk, @elonmusk, or https://x.com/elonmusk"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            disabled={loading}
            style={{ marginBottom: '16px' }}
          />

          {error && (
            <div
              style={{
                background: '#fee',
                border: '2px solid #c00',
                padding: '12px',
                marginBottom: '16px',
                fontFamily: 'VT323, monospace',
                fontSize: '18px',
                color: '#c00',
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-6">
              <FunnyLoading text={loadingMessage} />
              <p
                style={{
                  fontFamily: 'VT323, monospace',
                  fontSize: '16px',
                  color: '#999',
                  marginTop: '16px',
                }}
              >
                This might take 10–15 seconds. We're reading their timeline and calculating their delusion score.
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="retro-button"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              ROAST THIS TIMELINE →
            </button>
          )}
        </form>
      </div>

      {/* Info */}
      <div className="retro-card mt-6" style={{ padding: '16px' }}>
        <p className="pixel-font mb-2" style={{ fontSize: '9px', color: '#1a1a1a' }}>
          HOW IT WORKS
        </p>
        <ul
          style={{
            fontFamily: 'VT323, monospace',
            fontSize: '18px',
            color: '#666',
            lineHeight: 1.5,
            listStyle: 'none',
            padding: 0,
          }}
        >
          <li style={{ marginBottom: '8px' }}>
            → We grab their bio + last 5 tweets (no replies, no RTs, just pure unfiltered confidence)
          </li>
          <li style={{ marginBottom: '8px' }}>
            → Run it through the buzzword blender and calculate their bubble score (0–10)
          </li>
          <li style={{ marginBottom: '8px' }}>
            → Generate a roast so savage their feelings might be hurt (but you'll laugh)
          </li>
          <li>
            → Hand you a shareable badge to flex their delusion score — or yours, if you're brave enough
          </li>
        </ul>
      </div>
    </div>
  );
}
