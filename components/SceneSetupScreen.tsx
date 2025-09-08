import React, { useEffect, useState } from 'react';
import type { Theme } from '../constants';
import type { StoryPageImage } from '../types';
import { blendCharactersIntoScene } from '../services/geminiService';
import { urlToStoryPageImage } from '../utils/imageUtils';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface SceneSetupScreenProps {
  theme: Theme;
  userImage: StoryPageImage;
  petImage: StoryPageImage;
  onSceneReady: (scene: StoryPageImage) => void;
  onError: (message: string) => void;
}

export const SceneSetupScreen: React.FC<SceneSetupScreenProps> = ({
  theme,
  userImage,
  petImage,
  onSceneReady,
  onError,
}) => {
  const [status, setStatus] = useState('Setting the scene...');

  useEffect(() => {
    const setupScene = async () => {
      try {
        setStatus('Loading background assets...');
        const sceneAsset = theme.scenes[0];
        if (!sceneAsset) {
            throw new Error("Initial scene assets not found for the selected theme.");
        }
        const sceneUrl = `${theme.assetPath}/${sceneAsset.sceneFilename}`;
        const poiUrl = `${theme.assetPath}/${sceneAsset.poiFilename}`;

        const [sceneImage, poiImage] = await Promise.all([
          urlToStoryPageImage(sceneUrl),
          urlToStoryPageImage(poiUrl),
        ]);

        setStatus('Blending characters into the world...');
        const blendedScene = await blendCharactersIntoScene(
          userImage,
          petImage,
          sceneImage,
          poiImage
        );
        
        onSceneReady(blendedScene);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred while setting up the scene.';
        console.error(message);
        onError(message);
        // Note: The user will see the error message via the App component's state
        // and will need to use the 'back' button to try again.
      }
    };

    setupScene();
  }, [theme, userImage, petImage, onSceneReady, onError]);
  
  const backgroundUrl = theme.scenes[0] ? `${theme.assetPath}/${theme.scenes[0].sceneFilename}` : '';
  const backgroundImage = `url(${backgroundUrl})`;

  return (
    <div 
        className="fixed inset-0 bg-cover bg-center flex flex-col items-center justify-center text-white"
        style={{ backgroundImage }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div className="relative z-10 text-center p-4">
        <div className="relative inline-block">
          <div className="absolute -inset-2 border-4 border-amber-300 border-dashed rounded-full animate-spin"></div>
          <MagicWandIcon className="w-16 h-16 text-amber-400" />
        </div>
        <h1 className="mt-6 text-4xl font-sans font-bold animate-pulse [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            Designing Your World
        </h1>
        <p className="mt-2 text-xl font-serif [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            {status}
        </p>
      </div>
    </div>
  );
};