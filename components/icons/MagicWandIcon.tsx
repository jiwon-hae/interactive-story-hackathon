
import React from 'react';

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 4V2" />
    <path d="M15 10V8" />
    <path d="M12.5 6.5L14 5" />
    <path d="M10 12l-2-2 6-6 2 2-6 6" />
    <path d="M9 13l-1.5 1.5" />
    <path d="M15 13h2" />
    <path d="M21 15l-1.5-1.5" />
    <path d="M18 9l1.5-1.5" />
    <path d="M3 21l6-6" />
    <path d="M9 13a6 6 0 0 1-6 6" />
  </svg>
);
