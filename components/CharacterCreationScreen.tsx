import React, { useState } from 'react';
import type { StoryPageImage } from '../types';
import type { Theme } from '../constants';
import { ImageUpload } from './ImageUpload';
import { UserIcon } from './icons/UserIcon';
import { PetIcon } from './icons/PetIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { convertImageStyle } from '../services/geminiService';
import { urlToStoryPageImage } from '../utils/imageUtils';

interface CharacterCreationScreenProps {
  onContinue: (userImage: StoryPageImage, petImage: StoryPageImage) => void;
  onBack: () => void;
  theme: Theme;
}

export const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({ onContinue, onBack, theme }) => {
  const [userImage, setUserImage] = useState<StoryPageImage | null>(null);
  const [petImage, setPetImage] = useState<StoryPageImage | null>(null);

  const [convertedUserImage, setConvertedUserImage] = useState<StoryPageImage | null>(null);
  const [convertedPetImage, setConvertedPetImage] = useState<StoryPageImage | null>(null);
  
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConvert = userImage && petImage && !isConverting;
  const canContinue = convertedUserImage && convertedPetImage;

  const handleConvert = async () => {
    if (!canConvert) return;
    
    setIsConverting(true);
    setError(null);
    setConvertedUserImage(null);
    setConvertedPetImage(null);

    try {
      const charRefUrl = `${theme.assetPath}/${theme.characterRefFilename}`;
      const petRefUrl = `${theme.assetPath}/${theme.petRefFilename}`;

      const [charRefImage, petRefImage] = await Promise.all([
        urlToStoryPageImage(charRefUrl),
        urlToStoryPageImage(petRefUrl),
      ]);

      if (!userImage || !petImage) {
        throw new Error("User and pet images are required.");
      }

      const [convertedUser, convertedPet] = await Promise.all([
        convertImageStyle(userImage, charRefImage, 'person'),
        convertImageStyle(petImage, petRefImage, 'pet'),
      ]);

      setConvertedUserImage(convertedUser);
      setConvertedPetImage(convertedPet);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during conversion.';
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsConverting(false);
    }
  };

  const handleContinue = () => {
    if (canContinue) {
      onContinue(convertedUserImage, convertedPetImage);
    }
  };

  const backgroundUrl = `${theme.assetPath}/scene1.png`;
  const backgroundImage = `url(${backgroundUrl})`;

  const renderCharacterSlot = (
    type: 'user' | 'pet',
    setOriginalImage: (img: StoryPageImage | null) => void,
    convertedImage: StoryPageImage | null,
    clearConvertedImage: () => void
  ) => {
    const label = type === 'user' ? 'Your Photo' : "Fluffly Friend's Photo";
    const Icon = type === 'user' ? UserIcon : PetIcon;

    if (convertedImage) {
      return (
        <div className="w-full p-4 bg-white/60 rounded-2xl shadow-lg backdrop-blur-sm border border-amber-200 text-center">
            <h3 className="text-3xl font-bold font-sans text-amber-800">{label} (Converted!)</h3>
            <div className="mt-4 aspect-square w-full rounded-lg overflow-hidden relative group">
                <img src={`data:${convertedImage.mimeType};base64,${convertedImage.data}`} alt={`${label} converted preview`} className="w-full h-full object-contain" />
                <button 
                  onClick={clearConvertedImage}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold font-sans text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Change Photo
                </button>
            </div>
        </div>
      );
    }

    return <ImageUpload label={label} Icon={Icon} onImageUpload={setOriginalImage} />;
  };

  return (
    <div 
        className="h-screen flex items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="w-full max-w-5xl relative">
         <button 
          onClick={onBack}
          className="absolute top-0 left-0 -translate-y-full mb-4 flex items-center gap-2 text-white font-bold font-sans hover:text-amber-100 transition-colors [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
          aria-label="Back to style selection"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span>Back to Styles</span>
        </button>

        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-5xl sm:text-6xl font-black font-sans tracking-tight text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">Create Your Characters</h1>
          <p className="mt-3 text-2xl font-serif text-amber-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"> Upload a photo, then convert it to the story's style.</p>
        </header>
        
        {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
              <strong className="font-bold">Conversion Failed: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderCharacterSlot(
                'user',
                setUserImage,
                convertedUserImage,
                () => { setConvertedUserImage(null); setUserImage(null); }
            )}
            {renderCharacterSlot(
                'pet',
                setPetImage,
                convertedPetImage,
                () => { setConvertedPetImage(null); setPetImage(null); }
            )}
        </div>

        <footer className="mt-12 text-center">
            {canContinue ? (
                <button
                    onClick={handleContinue}
                    className="mx-auto flex items-center justify-center gap-4 px-10 py-5 bg-amber-500 text-white font-bold font-sans text-3xl rounded-xl shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-400 transition-transform duration-200 ease-in-out hover:scale-105"
                >
                    <span>Continue</span>
                    <ChevronRightIcon className="w-8 h-8" />
                </button>
            ) : (
                <button
                    onClick={handleConvert}
                    disabled={!canConvert || isConverting}
                    className="mx-auto flex items-center justify-center gap-4 px-10 py-5 bg-amber-500 text-white font-bold font-sans text-3xl rounded-xl shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-400 transition-transform duration-200 ease-in-out hover:scale-105 disabled:bg-amber-300 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isConverting ? (
                        <>
                            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                            <span>Converting...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-8 h-8" />
                            <span>Convert to Story Style</span>
                        </>
                    )}
                </button>
            )}
        </footer>
      </div>
    </div>
  );
};