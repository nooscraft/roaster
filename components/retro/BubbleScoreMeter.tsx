'use client';

interface BubbleScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function BubbleScoreMeter({ score, size = 'md' }: BubbleScoreMeterProps) {
  const clampedScore = Math.max(0, Math.min(10, score));
  const percentage = (clampedScore / 10) * 100;
  
  const getColor = (score: number) => {
    if (score < 3) return '#FFD23F';
    if (score < 6) return '#FF8C42';
    if (score < 8) return '#FF6B35';
    return '#FF5722';
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
            stroke="rgba(255, 255, 255, 0.1)"
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
            style={{
              filter: `drop-shadow(0 0 10px ${getColor(clampedScore)})`,
            }}
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
        <div className="text-orange-400 text-xs pixel-font">BUBBLE SCORE</div>
      </div>
    </div>
  );
}
