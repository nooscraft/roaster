'use client';

export default function SubmitPage() {
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

      <div className="retro-card text-center py-12">
        <p style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', color: '#c0392b', marginBottom: '16px' }}>
          COMING SOON
        </p>
        <p style={{ fontFamily: 'VT323, monospace', fontSize: '22px', color: '#555', lineHeight: '1.5', marginBottom: '8px' }}>
          Our roast cannon is still calibrating.
        </p>
        <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#888' }}>
          (Translation: our stochastic parrots are still in therapy.)
        </p>
      </div>
    </div>
  );
}
