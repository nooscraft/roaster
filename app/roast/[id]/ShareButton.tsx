'use client';

import confetti from 'canvas-confetti';

interface ShareButtonProps {
  shareUrl: string;
}

export function ShareButton({ shareUrl }: ShareButtonProps) {
  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Bubble pop confetti effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { x, y },
      colors: ['#F5C518', '#c0392b', '#1a1a1a'],
      shapes: ['circle'],
      scalar: 0.8,
      gravity: 1.2,
      ticks: 100,
    });

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="roast-view-btn"
      style={{
        border: '2px solid #1d4ed8',
        background: '#ffffff',
        color: '#1a1a1a',
        boxShadow: '3px 3px 0 #1d4ed8',
      }}
    >
      SHARE X
    </button>
  );
}
