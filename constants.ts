export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-image-preview';

export interface SceneAsset {
  sceneFilename: string;
  poiFilename: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  cardImageUrl: string;
  assetPath: string;
  characterRefFilename: string;
  petRefFilename: string;
  scenes: SceneAsset[];
}

export const THEMES: Record<string, Theme> = {
  // ghibli: {
  //   id: 'Ghibli',
  //   name: 'Ghibli Style',
  //   description: 'Whimsical tales in lush, hand-painted worlds. Gentle, magical, and full of heart.',
  //   cardImageUrl: '/assets/themes/ghibli/card-background.jpg',
  //   assetPath: '/assets/themes/ghibli',
  //   characterRefFilename: 'character_ref.png',
  //   petRefFilename: 'pet_ref.png',
  //   scenes: [
  //       { sceneFilename: 'scene1.png', poiFilename: 'scene1_poi.png' },
  //       { sceneFilename: 'scene2.png', poiFilename: 'scene2_poi.png' },
  //       { sceneFilename: 'scene3.png', poiFilename: 'scene3_poi.png' },
  //       { sceneFilename: 'scene4.png', poiFilename: 'scene4_poi.png' },
  //       { sceneFilename: 'scene5.png', poiFilename: 'scene5_poi.png' },
  //   ],
  // },
  kpop: {
    id: 'K-pop demon hunters',
    name: 'K-pop Demon Hunters',
    description: 'High-energy adventures with stylish heroes. Dynamic, action-packed, and vibrant.',
    cardImageUrl: '/assets/themes/kpop_demonhunters/card-background.jpg',
    assetPath: '/assets/themes/kpop_demonhunters',
    characterRefFilename: 'character_ref.png',
    petRefFilename: 'pet_ref.png',
    scenes: [
        { sceneFilename: 'scene1.png', poiFilename: 'scene1_poi.png' },
        { sceneFilename: 'scene2.png', poiFilename: 'scene2.png' },
        { sceneFilename: 'scene3.png', poiFilename: 'scene3.png' },
        { sceneFilename: 'scene4.png', poiFilename: 'scene4.png' },
        { sceneFilename: 'scene5.png', poiFilename: 'scene5.png' },
    ],
  },
};