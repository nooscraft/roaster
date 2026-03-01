'use client';

interface BubbleScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function BubbleScoreMeter({ score, size = 'md' }: BubbleScoreMeterProps) {
  const clampedScore = Math.max(0, Math.min(10, score));
  const percentage = (clampedScore / 10) * 100;
  const scoreExplanation =
    'Starts at 5.0, adds points for buzzwords/benchmark theater, subtracts for real shipping evidence, then clamps between 0 and 10.';
  
  const getColor = (score: number) => {
    if (score < 3) return '#22c55e'; // green - grounded
    if (score < 6) return '#F5C518'; // yellow - mild hype
    if (score < 8) return '#f97316'; // orange - hyped
    return '#ef4444';               // red - full bubble
  };

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={getColor(clampedScore)}
            strokeWidth="8"
            strokeDasharray={`${percentage * 2.51} 251`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className={`pixel-font ${textSizeClasses[size]} font-bold`}
            style={{ color: getColor(clampedScore) }}
          >
            {clampedScore.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="pixel-font" style={{ fontSize: '7px', color: '#888' }}>
          BUBBLE SCORE
        </div>
        <div className="relative inline-flex items-center gap-1 mt-1 group">
          <a
            href="/stats#bubble-score-rules"
            style={{
              display: 'inline-block',
              fontFamily: 'VT323, monospace',
              fontSize: '14px',
              color: '#555',
              textDecoration: 'underline',
            }}
            aria-label="How bubble score is calculated"
          >
            How scored?
          </a>
          <span
            tabIndex={0}
            className="pixel-font"
            style={{
              fontSize: '7px',
              color: '#1a1a1a',
              background: '#F5C518',
              border: '2px solid #1a1a1a',
              width: '16px',
              height: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              cursor: 'help',
            }}
            aria-label="Bubble score formula"
          >
            ?
          </span>

          <div
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
            style={{
              minWidth: '220px',
              maxWidth: '260px',
              background: '#F2ECD8',
              color: '#1a1a1a',
              border: '2px solid #1a1a1a',
              boxShadow: '3px 3px 0 #1a1a1a',
              padding: '8px 10px',
              fontFamily: 'VT323, monospace',
              fontSize: '17px',
              lineHeight: 1.2,
              zIndex: 5,
              textAlign: 'left',
            }}
          >
            {scoreExplanation}
          </div>
        </div>
      </div>
    </div>
  );
}
