import React, { useState, useEffect, useCallback } from 'react';
import { ThemeSelectionScreen } from './components/ThemeSelectionScreen';
import { CharacterCreationScreen } from './components/CharacterCreationScreen';
import { SceneSetupScreen } from './components/SceneSetupScreen';
import { InteractiveStoryScreen } from './components/InteractiveStoryScreen';
import { LoadingIndicator } from './components/LoadingIndicator';
import type { StoryPageImage } from './types';
import { THEMES } from './constants';

type AppScreen = 'theme' | 'characters' | 'sceneSetup' | 'story';

function App() {
  const [screen, setScreen] = useState<AppScreen>('theme');
  
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<StoryPageImage | null>(null);
  const [petImage, setPetImage] = useState<StoryPageImage | null>(null);
  const [generatedScene, setGeneratedScene] = useState<StoryPageImage | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [isSettingUpScene, setIsSettingUpScene] = useState(false);

  const themeData = selectedTheme 
    ? Object.values(THEMES).find(theme => theme.id === selectedTheme) 
    : null;

  const clearError = () => {
    setAppError(null);
  }

  useEffect(() => {
    if (appError) {
      const timer = setTimeout(() => {
        setAppError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [appError]);

  const handleReset = () => {
    setSelectedTheme(null);
    setUserImage(null);
    setPetImage(null);
    setGeneratedScene(null);
    setScreen('theme');
  }
  
  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setScreen('characters');
  };

  const handleCharactersContinue = (userImg: StoryPageImage, petImg: StoryPageImage) => {
    setUserImage(userImg);
    setPetImage(petImg);
    setScreen('sceneSetup');
    setIsSettingUpScene(true);
  }

  const handleSceneReady = (scene: StoryPageImage) => {
    setGeneratedScene(scene);
    setIsSettingUpScene(false);
    setScreen('story');
  }

  const handleSceneError = (message: string) => {
    setAppError(message);
    setIsSettingUpScene(false);
    setScreen('characters'); // Go back to allow retry
  }

  const handleBack = () => {
    if (screen === 'story') {
        handleReset();
    } else if (screen === 'sceneSetup') {
        setScreen('characters');
    } else if (screen === 'characters') {
        setScreen('theme');
    }
  }

  const renderScreen = () => {
    switch(screen) {
      case 'theme':
        return <ThemeSelectionScreen onSelectTheme={handleThemeSelect} />;
      case 'characters':
        if (!themeData) {
            setScreen('theme');
            return null;
        }
        return <CharacterCreationScreen 
          onContinue={handleCharactersContinue} 
          onBack={handleBack}
          theme={themeData}
        />;
      case 'sceneSetup':
        if (!themeData || !userImage || !petImage) {
            setScreen('characters');
            return null;
        }
        return <SceneSetupScreen 
            theme={themeData}
            userImage={userImage}
            petImage={petImage}
            onSceneReady={handleSceneReady}
            onError={handleSceneError}
        />
      case 'story':
         if (!generatedScene || !themeData || !userImage || !petImage) {
            handleReset();
            return null;
         }
         return (
            <InteractiveStoryScreen
              initialScene={generatedScene}
              theme={themeData}
              onReset={handleReset}
              userImage={userImage}
              petImage={petImage}
            />
          );
      default:
        return <ThemeSelectionScreen onSelectTheme={handleThemeSelect} />;
    }
  }

  return (
    <>
      {isSettingUpScene && <LoadingIndicator />}
      
      {appError && (
        <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-pulse" onClick={clearError}>
          <strong className="font-bold">Oh no! </strong>
          <span className="block sm:inline">{appError}</span>
        </div>
      )}
      
      {renderScreen()}
    </>
  );
}

export default App;
