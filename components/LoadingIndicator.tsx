
import React from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-amber-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-amber-800">
      <div className="relative">
        <div className="absolute -inset-2 border-4 border-amber-300 border-dashed rounded-full animate-spin"></div>
        <MagicWandIcon className="w-16 h-16 text-amber-500" />
      </div>
      <p className="mt-6 text-2xl font-sans font-bold animate-pulse">Brewing up a new adventure...</p>
      <p className="mt-2 text-lg font-serif">The magic is happening!</p>
    </div>
  );
};
