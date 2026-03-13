import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2ECD8', padding: '20px' }}>
      <div className="retro-card text-center" style={{ maxWidth: '600px', padding: '32px 24px' }}>
        <p
          className="pixel-font"
          style={{
            fontSize: '48px',
            color: '#c0392b',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
        >
          404
        </p>
        <h1
          style={{
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '14px',
            color: '#1a1a1a',
            lineHeight: '1.6',
            marginBottom: '16px',
          }}
        >
          This roast was too grounded and got removed
        </h1>
        <p
          style={{
            fontFamily: 'VT323, monospace',
            fontSize: '22px',
            color: '#666',
            lineHeight: 1.4,
            marginBottom: '24px',
          }}
        >
          We only keep the delusional stuff around here. This page had actual substance, so we had to let it go.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="retro-button" style={{ textDecoration: 'none' }}>
            ← BACK TO FEED
          </Link>
          <Link href="/leaderboard" className="retro-button" style={{ textDecoration: 'none' }}>
            LEADERBOARD
          </Link>
        </div>
        <p
          style={{
            fontFamily: 'VT323, monospace',
            fontSize: '16px',
            color: '#999',
            marginTop: '24px',
          }}
        >
          (Or you just typed the wrong URL. That works too.)
        </p>
      </div>
    </div>
  );
}
