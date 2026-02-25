import { ReactNode } from 'react';

interface RetroCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'orange' | 'yellow' | 'coral';
}

export function RetroCard({ children, className = '', variant = 'orange' }: RetroCardProps) {
  const borderClass = {
    orange: 'retro-border',
    coral: 'retro-border-orange',
    yellow: 'retro-border-yellow',
  }[variant];

  return (
    <div className={`retro-card ${borderClass} ${className}`}>
      {children}
    </div>
  );
}
