import { ReactNode } from 'react';

interface RetroBadgeProps {
  children: ReactNode;
  className?: string;
}

export function RetroBadge({ children, className = '' }: RetroBadgeProps) {
  return (
    <span className={`retro-badge ${className}`}>
      {children}
    </span>
  );
}
