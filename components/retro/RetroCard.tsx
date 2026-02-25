import { ReactNode } from 'react';

interface RetroCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'orange' | 'yellow' | 'coral';
  onClick?: (e: React.MouseEvent) => void;
}

export function RetroCard({ children, className = '', variant = 'orange', onClick }: RetroCardProps) {
  const borderClass = {
    orange: 'retro-border',
    coral: 'retro-border-orange',
    yellow: 'retro-border-yellow',
  }[variant];

  return (
    <div className={`retro-card ${borderClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
