import React from 'react';

export const SnowflakeIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <line x1="12" y1="2" x2="12" y2="22"></line>
    <line x1="17" y1="5" x2="7" y2="19"></line>
    <line x1="7" y1="5" x2="17" y2="19"></line>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <line x1="5" y1="17" x2="19" y2="7"></line>
    <line x1="5" y1="7" x2="19" y2="17"></line>
  </svg>
);
