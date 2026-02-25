import { ReactNode } from 'react';

interface RetroTableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export function RetroTable({ headers, children, className = '' }: RetroTableProps) {
  return (
    <table className={`retro-table ${className}`}>
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th key={i}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
