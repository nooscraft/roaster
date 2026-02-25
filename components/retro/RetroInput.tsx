import { InputHTMLAttributes } from 'react';

interface RetroInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function RetroInput({ label, className = '', ...props }: RetroInputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-cyan-300 mb-2 pixel-font text-xs">
          {label}
        </label>
      )}
      <input
        className={`retro-input w-full ${className}`}
        {...props}
      />
    </div>
  );
}
