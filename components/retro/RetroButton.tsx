import { ButtonHTMLAttributes, ReactNode } from 'react';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function RetroButton({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}: RetroButtonProps) {
  return (
    <button
      className={`retro-button ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
