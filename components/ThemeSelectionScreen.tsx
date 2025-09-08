import React from 'react';
import { THEMES } from '../constants';

interface ThemeSelectionScreenProps {
  onSelectTheme: (theme: string) => void;
}

const ThemeCard: React.FC<{
  title: string;
  description: string;
  imageUrl: string;
  onClick: () => void;
}> = ({ title, description, imageUrl, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-400`}
  >
    <div
      style={{ backgroundImage: `url(${imageUrl})` }}
      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
    <div className="relative h-full flex flex-col justify-end p-6 sm:p-8 text-white text-left">
      <h2 className="text-4xl sm:text-5xl font-black font-sans tracking-tight">{title}</h2>
      <p className="mt-2 font-serif text-xl opacity-90">{description}</p>
    </div>
  </button>
);

export const ThemeSelectionScreen: React.FC<ThemeSelectionScreenProps> = ({ onSelectTheme }) => {
  const themes = Object.values(THEMES);

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-amber-50">
      <header className="text-center mb-8 sm:mb-12">
        <h1 className="text-5xl sm:text-6xl font-black font-sans tracking-tight text-amber-900">Choose Your Story's Style</h1>
        <p className="mt-3 text-2xl font-serif text-amber-700">Every great story begins with a world.</p>
      </header>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            title={theme.name}
            description={theme.description}
            imageUrl={theme.cardImageUrl}
            onClick={() => onSelectTheme(theme.id)}
          />
        ))}
      </div>
    </div>
  );
};