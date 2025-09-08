import React from 'react';

export const CloudRainIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M20 16.2A8.97 8.97 0 0 0 12 8c-1.85 0-3.55.63-4.9 1.69"></path>
    <path d="M16 16.2A8.97 8.97 0 0 0 12 8c-1.85 0-3.55.63-4.9 1.69"></path>
    <path d="M16 16.2A4.5 4.5 0 0 0 12 8a4.5 4.5 0 0 0-4 4.5c0 2.21 1.79 4 4 4h.5"></path>
    <path d="M19.4 14.6a4.5 4.5 0 0 0-8.8 0"></path>
    <path d="M8 19v1"></path>
    <path d="M12 21v1"></path>
    <path d="M16 19v1"></path>
  </svg>
);
