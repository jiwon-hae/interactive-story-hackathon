import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { StoryPage, StoryPageImage } from '../types';
import { THEMES, type Theme } from '../constants';
import { moveCharactersToNewSceneWithPOI, generateImageFromImage, generateStoryTextForImage, revealPetInCircle, generate3dFigureImage, moveCharactersToNewSceneAndEdit, changeSceneForDressUp } from '../services/geminiService';
import { urlToStoryPageImage } from '../utils/imageUtils';
import { HomeIcon } from './icons/HomeIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { SunIcon } from './icons/SunIcon';
import { CloudIcon } from './icons/CloudIcon';
import { CloudRainIcon } from './icons/CloudRainIcon';
import { SnowflakeIcon } from './icons/SnowflakeIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DrawingCanvas } from './DrawingCanvas';

interface InteractiveStoryScreenProps {
  initialScene: StoryPageImage;
  theme: Theme;
  onReset: () => void;
  userImage: StoryPageImage;
  petImage: StoryPageImage;
}

type WeatherOption = 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy';

const weatherPrompts: Record<WeatherOption, string> = {
    Sunny: "Transform the scene to a sunny day. Preserve the characters and their positions.",
    Rainy: "Transform the scene to a rainy day. Preserve the characters and their positions.",
    Cloudy: "Transform the scene to a cloudy day. Preserve the characters and their positions.",
    Snowy: "Transform the scene to a snowy day. Preserve the characters and their positions.",
};

type ClothingOption = { label: string; prompt: string };

const clothingOptions: Record<WeatherOption, ClothingOption[]> = {
    Sunny: [
        { label: 'Hat', prompt: 'Add a sun hat to the person and a tiny matching one for the pet.' },
        { label: 'Shoes', prompt: 'Give the person cool sneakers and the pet tiny boots.' },
        { label: 'Dress', prompt: 'Put the person in a light, summery dress.' },
        { label: 'Shorts', prompt: 'Change the person\'s outfit to shorts and a t-shirt.' },
    ],
    Cloudy: [
        { label: 'Hoodie', prompt: 'Give the person a cozy hoodie and the pet a little sweater.' },
        { label: 'Long Shirt', prompt: 'Change the person\'s outfit to a long-sleeved shirt.' },
    ],
    Rainy: [
        { label: 'Umbrella', prompt: 'Give the person a colorful umbrella to hold over themselves and their pet.' },
        { label: 'Rain Coat', prompt: 'Put the person in a bright yellow raincoat and the pet in a tiny matching one.' },
    ],
    Snowy: [
        { label: 'Heavy Outer', prompt: 'Dress the person in a warm winter coat, scarf, and beanie. Give the pet a warm jacket.' },
        { label: 'Fur Coat', prompt: 'Put the person in a stylish faux-fur coat and the pet in a tiny, fluffy one.' },
    ],
};


export const InteractiveStoryScreen: React.FC<InteractiveStoryScreenProps> = ({ initialScene, theme, onReset, userImage, petImage }) => {
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<WeatherOption | null>(null);
  const [selectedClothing, setSelectedClothing] = useState<ClothingOption | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(1); // Scene 0 is the initial one
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const hasStarted = storyPages.length > 0;
  const currentPage = hasStarted ? storyPages[currentPageIndex] : null;
  const isLastPage = hasStarted && currentPageIndex === storyPages.length - 1;

  const initialSceneUrl = `data:${initialScene.mimeType};base64,${initialScene.data}`;
  const pageImageUrl = currentPage ? `data:${currentPage.image.mimeType};base64,${currentPage.image.data}` : initialSceneUrl;

  const [backgroundUrl, setBackgroundUrl] = useState<string>(initialSceneUrl);

  useEffect(() => {
    // This ensures that when navigating back and forth, the background updates correctly.
    // It also sets the final image after the transitional background is shown during generation.
    setBackgroundUrl(pageImageUrl);
  }, [pageImageUrl]);

  const handleStartStory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const firstPage: StoryPage = {
        id: crypto.randomUUID(),
        text: 'Page 1',
        image: initialScene,
      };
      setStoryPages([firstPage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [initialScene]);

  const handleWeatherSelection = useCallback(async (weather: WeatherOption) => {
    if (storyPages.length !== 1) return;

    setSelectedWeather(weather);
    setIsLoading(true);
    setError(null);
    
    const initialPageImage = storyPages[0].image;

    try {
      // Page 2: Apply weather to the current scene (scene 1)
      const weatherOnScene1Image = await generateImageFromImage(
          `${weatherPrompts[weather]} Ensure the characters' appearances, clothing, and poses are perfectly preserved.`, 
          initialPageImage,
          { user: userImage, pet: petImage }
      );
      const pageTwo: StoryPage = {
        id: crypto.randomUUID(),
        image: weatherOnScene1Image,
        text: `Wow, it's a ${weather.toLowerCase()} day!`,
      };

      // Set transitional background to show the weather change immediately
      const pageTwoImageUrl = `data:${pageTwo.image.mimeType};base64,${pageTwo.image.data}`;
      setBackgroundUrl(pageTwoImageUrl);

      // Page 3: Move to the dress-up room (scene 2)
      const sceneAsset = theme.scenes[currentSceneIndex]; // This will be scene 2
      if (!sceneAsset) {
        throw new Error("Dressing scene assets not found for the selected theme.");
      }
      const sceneUrl = `${theme.assetPath}/${sceneAsset.sceneFilename}`;
      const poiUrl = `${theme.assetPath}/${sceneAsset.poiFilename}`;

      const [sceneImage, poiImage] = await Promise.all([
        urlToStoryPageImage(sceneUrl),
        urlToStoryPageImage(poiUrl),
      ]);
      
      // Generate the weather-themed background for the dress-up room
      const weatherSceneImage = await generateImageFromImage(weatherPrompts[weather], sceneImage);

      // Move characters from the weather-updated scene 1 into the new dress-up room
      const pageThreeImage = await changeSceneForDressUp(
        weatherSceneImage,
        poiImage,
        userImage,
        petImage
      );
      
      const pageThree: StoryPage = {
        id: crypto.randomUUID(),
        image: pageThreeImage,
        text: `Let's get dressed for the day!`,
      };

      setStoryPages(prev => [...prev, pageTwo, pageThree]);
      setCurrentPageIndex(prev => prev + 2);
      setCurrentSceneIndex(prev => prev + 1);

    } catch (err) {
      // In case of error, revert the background to the previous page's image
      const previousPageImageUrl = `data:${initialPageImage.mimeType};base64,${initialPageImage.data}`;
      setBackgroundUrl(previousPageImageUrl);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [storyPages, theme, currentSceneIndex, userImage, petImage]);
  
  const handleClothingSelection = useCallback(async (clothingOption: ClothingOption) => {
    if (storyPages.length !== 3) return;

    setIsLoading(true);
    setError(null);
    setSelectedClothing(clothingOption);
    try {
        const previousPageImage = storyPages[storyPages.length - 1].image;
        
        const newImage = await generateImageFromImage(
            clothingOption.prompt, 
            previousPageImage,
            { user: userImage, pet: petImage }
        );

        const nextPage: StoryPage = {
            id: crypto.randomUUID(),
            image: newImage,
            text: "We are ready, let's go outside",
        };

        setStoryPages(prev => [...prev, nextPage]);
        setCurrentPageIndex(prev => prev + 1);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  }, [storyPages, userImage, petImage]);

  const handleContinueStory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const consistencyPrompt = selectedWeather && selectedClothing
        ? `The weather is ${selectedWeather}. The characters are dressed for this weather as described: "${selectedClothing.prompt}". Maintain this appearance unless instructed otherwise.`
        : '';

      // Handle generation of the final 3D figure page (Page 10)
      if (storyPages.length === 9) {
          const lastPageImage = storyPages[8].image;
          const figureImage = await generate3dFigureImage(lastPageImage, userImage, petImage);
          const nextPage: StoryPage = {
              id: crypto.randomUUID(),
              image: figureImage,
              text: "Here's a special keepsake from your adventure!",
          };
          setStoryPages(prev => [...prev, nextPage]);
          setCurrentPageIndex(prev => prev + 1);
          return;
      }
      
      // Handle the final "goodnight" page (Page 9)
      if (storyPages.length === 8) {
        const sceneAsset = theme.scenes[currentSceneIndex];
        if (!sceneAsset) {
          throw new Error("Final scene assets not found.");
        }
        
        const sceneUrl = `${theme.assetPath}/${sceneAsset.sceneFilename}`;
        const poiUrl = `${theme.assetPath}/${sceneAsset.poiFilename}`;
        const [nextSceneBaseImage, poiImage] = await Promise.all([
          urlToStoryPageImage(sceneUrl),
          urlToStoryPageImage(poiUrl),
        ]);

        const bgPrompt = `Redraw ONLY THE BACKGROUND of this scene in the established story style. It should be dark at night. REMOVE any people or animals from the scene, leaving an empty background ready for characters to be added later.`;
        const nextSceneStyledImage = await generateImageFromImage(bgPrompt, nextSceneBaseImage);
        
        const previousPageImage = storyPages[storyPages.length - 1].image;
        
        const editPrompt = "Change the person's and pet's outfits to pajamas. The person should look sleepy and be ready for bed, maybe yawning or rubbing their eyes. The pet can be curled up or sleepy too.";
        const finalImage = await moveCharactersToNewSceneAndEdit(
          previousPageImage,
          nextSceneStyledImage,
          poiImage,
          editPrompt,
          userImage,
          petImage
        );
        
        const nextPage: StoryPage = {
          id: crypto.randomUUID(),
          image: finalImage,
          text: "It was fun tonight. Good night!",
        };
        setStoryPages(prev => [...prev, nextPage]);
        setCurrentPageIndex(prev => prev + 1);
        // Do not increment scene index for the last page
        return;
      }

      const isHideAndSeekPage = storyPages.length === 6;
      const previousPageImage = storyPages[storyPages.length - 1].image;
      
      let finalImage: StoryPageImage;
      let newText: string;

      if (isHideAndSeekPage) {
        // Hide pet in the current scene (park) without changing background.
        const baseHidePrompt = "You are a master photo editor. Your task is to take the pet from the image and hide it cleverly somewhere in the background, making it partially visible or camouflaged. The person must remain clearly visible and their appearance, clothing, and pose should be preserved. The overall art style of the final image must be maintained. The final output should be only the final, edited image.";
        const hidePrompt = `${consistencyPrompt} ${baseHidePrompt}`;
        finalImage = await generateImageFromImage(
            hidePrompt, 
            previousPageImage,
            { user: userImage, pet: petImage }
        );
        newText = "We are at the park! Your fluffy friend is hiding somewhere, where is he? Circle the place you think your friend is hiding";
      } else {
        // Regular page continuation with scene transition
        const sceneAsset = theme.scenes[currentSceneIndex];
        if (!sceneAsset) {
          throw new Error("You've reached the end of the adventure!");
        }
        
        const sceneUrl = `${theme.assetPath}/${sceneAsset.sceneFilename}`;
        const poiUrl = `${theme.assetPath}/${sceneAsset.poiFilename}`;

        const [nextSceneBaseImage, poiImage] = await Promise.all([
          urlToStoryPageImage(sceneUrl),
          urlToStoryPageImage(poiUrl),
        ]);

        const weatherClause = selectedWeather ? `The weather should be ${selectedWeather.toLowerCase()}.` : '';
        const bgPrompt = `Redraw ONLY THE BACKGROUND of this scene in the established story style. ${weatherClause} REMOVE any people or animals from the scene, leaving an empty background ready for characters to be added later.`;
        const nextSceneStyledImage = await generateImageFromImage(bgPrompt, nextSceneBaseImage);
        
        const isPage4 = storyPages.length === 4;

        if (isPage4) {
          const posePrompt = "The person and pet should be walking side-by-side. They should both have happy expressions.";
          const editPrompt = `${consistencyPrompt} ${posePrompt}`;
          finalImage = await moveCharactersToNewSceneAndEdit(
            previousPageImage,
            nextSceneStyledImage,
            poiImage,
            editPrompt,
            userImage,
            petImage
          );
          newText = "Yay it's going to be fun today!";
        } else {
          finalImage = await moveCharactersToNewSceneWithPOI(
            previousPageImage, 
            nextSceneStyledImage, 
            poiImage,
            userImage,
            petImage,
            consistencyPrompt
          );
          if (storyPages.length === 5) { // This will be page 6
            newText = "It's so fun to play with my friend!";
          } else {
            newText = `Page ${storyPages.length + 1}`;
          }
        }
        
        setCurrentSceneIndex(prev => prev + 1);
      }

      const nextPage: StoryPage = {
        id: crypto.randomUUID(),
        image: finalImage,
        text: newText,
      };
      setStoryPages(prev => [...prev, nextPage]);
      setCurrentPageIndex(prev => prev + 1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [theme, selectedWeather, selectedClothing, currentSceneIndex, storyPages, userImage, petImage]);

  const handlePrevPage = () => setCurrentPageIndex(prev => Math.max(0, prev - 1));
  const handleNextPage = () => setCurrentPageIndex(prev => Math.min(prev + 1, storyPages.length - 1));

  const isDrawingPage = isLastPage && storyPages.length === 7;

  useEffect(() => {
    const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFindPet = useCallback(async (maskDataUrl: string) => {
    if (!isDrawingPage) return;

    setIsLoading(true);
    setError(null);
    try {
        const sceneWithHiddenPet = storyPages[6].image;
        
        const base64Data = maskDataUrl.split(',')[1];
        if (!base64Data) {
            throw new Error("Could not extract base64 data from mask.");
        }
        
        const maskImage: StoryPageImage = {
            data: base64Data,
            mimeType: 'image/png',
        };

        const revealedImage = await revealPetInCircle(
            sceneWithHiddenPet,
            petImage,
            maskImage
        );

        const finalPage: StoryPage = {
            id: crypto.randomUUID(),
            image: revealedImage,
            text: "I found you, my fluffy friend!",
        };

        setStoryPages(prev => [...prev, finalPage]);
        setCurrentPageIndex(prev => prev + 1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while finding the pet.');
    } finally {
      setIsLoading(false);
    }
  }, [isDrawingPage, storyPages, petImage]);

  if (!hasStarted) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: `url(${initialSceneUrl})` }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white">
          <header className="mb-8 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
            <div className="inline-flex items-center gap-4">
              <BookOpenIcon className="w-16 h-16" />
              <h1 className="text-6xl md:text-7xl font-black font-sans tracking-tight">The Adventure Begins</h1>
            </div>
            <p className="mt-4 text-2xl font-serif text-amber-100">Your characters are ready. Let's start their story.</p>
          </header>
          <button
            onClick={handleStartStory}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-white font-bold font-sans text-2xl rounded-xl shadow-md hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-400 transition-transform duration-200 ease-in-out hover:scale-105 disabled:bg-amber-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : "Start Story"}
            {!isLoading && <ChevronRightIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    );
  }
  
  const isWeatherSelectionStep = isLastPage && storyPages.length === 1;
  const isClothingSelectionStep = isLastPage && storyPages.length === 3 && !!selectedWeather;
  const canContinue = isLastPage && !isWeatherSelectionStep && !isClothingSelectionStep && storyPages.length < 10;

  return (
    <div className="h-screen w-screen flex flex-col bg-cover bg-center relative" style={{ backgroundImage: `url(${backgroundUrl})` }}>
       {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <span className="text-2xl font-sans font-bold text-white animate-pulse">The story continues...</span>
        </div>
      )}
       {error && (
        <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-[60]" onClick={() => setError(null)}>
          <strong className="font-bold">Oh no! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isDrawingPage && (
        <DrawingCanvas 
          width={windowSize.width}
          height={windowSize.height}
          onDrawEnd={handleFindPet}
        />
      )}

      {/* Gradient for text legibility */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col flex-grow w-full max-w-7xl mx-auto p-4 sm:p-8 mt-auto">
          <footer className="bg-transparent text-white w-full">
            <div className="flex justify-between items-center min-h-[4rem]">
              <div>
                <button
                  onClick={onReset}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 text-amber-800 font-bold text-lg rounded-lg shadow-md hover:bg-white transition-colors"
                >
                  <HomeIcon className="w-5 h-5" />
                  New Story
                </button>
              </div>

              <div className="flex-grow text-center px-4 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                {isWeatherSelectionStep && (
                  <div className="w-full max-w-lg mx-auto">
                    <p className="text-center text-xl font-sans font-bold text-white mb-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">What happens to the weather?</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <button onClick={() => handleWeatherSelection('Sunny')} className="flex items-center justify-center gap-2 p-3 bg-white/20 rounded-lg hover:bg-white/40 backdrop-blur-sm transition-colors text-lg font-sans text-white font-semibold"><SunIcon className="w-5 h-5"/> Sunny</button>
                      <button onClick={() => handleWeatherSelection('Cloudy')} className="flex items-center justify-center gap-2 p-3 bg-white/20 rounded-lg hover:bg-white/40 backdrop-blur-sm transition-colors text-lg font-sans text-white font-semibold"><CloudIcon className="w-5 h-5"/> Cloudy</button>
                      <button onClick={() => handleWeatherSelection('Rainy')} className="flex items-center justify-center gap-2 p-3 bg-white/20 rounded-lg hover:bg-white/40 backdrop-blur-sm transition-colors text-lg font-sans text-white font-semibold"><CloudRainIcon className="w-5 h-5"/> Rainy</button>
                      <button onClick={() => handleWeatherSelection('Snowy')} className="flex items-center justify-center gap-2 p-3 bg-white/20 rounded-lg hover:bg-white/40 backdrop-blur-sm transition-colors text-lg font-sans text-white font-semibold"><SnowflakeIcon className="w-5 h-5"/> Snowy</button>
                    </div>
                  </div>
                )}
                {isClothingSelectionStep && (
                  <div className="w-full max-w-lg mx-auto">
                      <p className="text-center text-xl font-sans font-bold text-white mb-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">Let's get dressed for the day!</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {clothingOptions[selectedWeather as WeatherOption].map((option: ClothingOption) => (
                              <button 
                                  key={option.label}
                                  onClick={() => handleClothingSelection(option)}
                                  className="p-3 bg-white/20 rounded-lg hover:bg-white/40 backdrop-blur-sm transition-colors text-lg font-sans text-white font-semibold"
                              >
                                  {option.label}
                              </button>
                          ))}
                      </div>
                  </div>
                )}
                {!isWeatherSelectionStep && !isClothingSelectionStep && currentPage && (
                  <p className="text-2xl md:text-3xl font-serif leading-relaxed">
                    {currentPage.text}
                  </p>
                )}
              </div>
              
              <div className="min-w-[180px] flex justify-end">
                {storyPages.length > 1 && !isWeatherSelectionStep && !isClothingSelectionStep && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPageIndex === 0}
                      className="p-3 bg-white/80 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeftIcon className="w-6 h-6 text-amber-800" />
                    </button>
                    
                    {isLastPage ? (
                        canContinue ? (
                            <button
                                onClick={handleContinueStory}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white text-lg font-bold rounded-full shadow-lg hover:bg-amber-600 transition-colors transform hover:scale-105 disabled:bg-amber-300"
                                aria-label="Continue Story"
                            >
                                <span>Continue Story</span>
                                <SparklesIcon className="w-6 h-6" />
                            </button>
                        ) : !isDrawingPage ? (
                            <div className="px-6 py-3 bg-white/80 text-slate-800 text-lg font-bold rounded-full shadow-md">
                                The End
                            </div>
                        ) : null
                    ) : (
                        <button
                            onClick={handleNextPage}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white text-lg font-bold rounded-full shadow-lg hover:bg-amber-600 transition-colors transform hover:scale-105"
                            aria-label="Next Page"
                        >
                            <span>Next Page</span>
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
};