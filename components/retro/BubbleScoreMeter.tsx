'use client';

interface BubbleScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function BubbleScoreMeter({ score, size = 'md' }: BubbleScoreMeterProps) {
  const clampedScore = Math.max(0, Math.min(10, score));
  const percentage = (clampedScore / 10) * 100;
  
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
        <div className="pixel-font" style={{ fontSize: '7px', color: '#888' }}>BUBBLE SCORE</div>
      </div>
    </div>
  );
}
