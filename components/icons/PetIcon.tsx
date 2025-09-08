import React from 'react';

export const PetIcon: React.FC<{ className?: string }> = ({ className }) => (
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
        <path d="M14.5 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"></path>
        <path d="M10.5 16.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"></path>
        <path d="M18.5 16.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"></path>
        <path d="M12 18s-4-3-4-8a4 4 0 1 1 8 0c0 5-4 8-4 8Z"></path>
    </svg>
);
