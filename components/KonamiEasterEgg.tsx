'use client';

import { useEffect, useState } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

const EASTER_EGG_ROAST = {
  archetype: 'Meta Self-Aware Bubble Maximalist',
  handle: 'froth_live',
  translation:
    'We built a site to roast AI hype, then used AI to generate the roasts. The irony is not lost on us, but the bubble score is still 9.2.',
  realityCheck:
    "This is what happens when you let the LLMs run the asylum. At least we're self-aware enough to roast ourselves.",
  bubbleScore: 9.2,
};

export function KonamiEasterEgg() {
  const [keys, setKeys] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const updated = [...prev, e.key].slice(-KONAMI_CODE.length);
        if (updated.join(',') === KONAMI_CODE.join(',')) {
          setShowModal(true);
          return [];
        }
        return updated;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!showModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={() => setShowModal(false)}
    >
      <div
        className="retro-card"
        style={{
          maxWidth: '600px',
          width: '100%',
          padding: '24px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setShowModal(false)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#1a1a1a',
            color: '#F5C518',
            border: '2px solid #1a1a1a',
            padding: '4px 8px',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <p
          className="pixel-font"
          style={{
            fontSize: '10px',
            color: '#c0392b',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          🎮 KONAMI CODE UNLOCKED 🎮
        </p>

        <h2
          style={{
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '12px',
            color: '#c0392b',
            lineHeight: '1.6',
            marginBottom: '12px',
          }}
        >
          {EASTER_EGG_ROAST.archetype}
        </h2>

        <a
          href={`https://x.com/${EASTER_EGG_ROAST.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="roast-handle"
          style={{ marginBottom: '16px' }}
        >
          @{EASTER_EGG_ROAST.handle}
        </a>

        <div className="roast-translation" style={{ marginBottom: '12px' }}>
          <span className="roast-label">WHAT THEY MEANT</span>
          <p style={{ fontSize: '18px' }}>{EASTER_EGG_ROAST.translation}</p>
        </div>

        <div className="roast-reality" style={{ marginBottom: '16px' }}>
          <span className="roast-label">REALITY CHECK</span>
          <p style={{ fontSize: '18px' }}>{EASTER_EGG_ROAST.realityCheck}</p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '2px solid #1a1a1a',
          }}
        >
          <span
            className="pixel-font"
            style={{ fontSize: '10px', color: '#888' }}
          >
            BUBBLE SCORE
          </span>
          <span
            className="pixel-font"
            style={{ fontSize: '18px', color: '#ef4444', fontWeight: 'bold' }}
          >
            {EASTER_EGG_ROAST.bubbleScore.toFixed(1)}
          </span>
        </div>

        <p
          style={{
            fontFamily: 'VT323, monospace',
            fontSize: '14px',
            color: '#666',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          You found the secret roast. Now close this and pretend you didn&apos;t.
        </p>
      </div>
    </div>
  );
}
