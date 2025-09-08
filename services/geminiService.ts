import { GoogleGenAI, Modality, Part } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import type { StoryPageImage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface StoryPageData {
  text: string;
  image: StoryPageImage;
}

export const generateStoryPage = async (prompt: string, images: StoryPageImage[]): Promise<StoryPageData> => {
  try {
    const parts: Part[] = [];

    // The model performs better if the image comes first.
    images.forEach(image => {
        parts.push({
            inlineData: {
                data: image.data,
                mimeType: image.mimeType,
            },
        });
    });

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from API.");
    }

    const contentParts = response.candidates[0].content.parts;
    let generatedText = '';
    let generatedImage: StoryPageImage | null = null;

    for (const part of contentParts) {
      if (part.text) {
        generatedText = part.text;
      } else if (part.inlineData) {
        generatedImage = {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    if (!generatedText || !generatedImage) {
      throw new Error("API response did not include both text and an image.");
    }

    return { text: generatedText, image: generatedImage };
  } catch (error) {
    console.error("Error generating story page:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate story page: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the story page.");
  }
};

export const convertImageStyle = async (
  sourceImage: StoryPageImage,
  styleImage: StoryPageImage,
  subjectType: 'person' | 'pet'
): Promise<StoryPageImage> => {
    try {
        const subject = subjectType === 'person' ? 'person' : 'pet';
        const prompt = `Convert ${subject} from the first image to look like a ${subject} from the second image. The new image should feature only the ${subject}. Depict the detailed textures, styles of person`;

        const parts: Part[] = [
            { inlineData: { data: sourceImage.data, mimeType: sourceImage.mimeType } },
            { inlineData: { data: styleImage.data, mimeType: styleImage.mimeType } },
            { text: prompt },
        ];

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from style conversion.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API response did not include a converted image.");
        }

        return {
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };

    } catch (error) {
        console.error("Error converting image style:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to convert image style: ${error.message}`);
        }
        throw new Error("An unknown error occurred during style conversion.");
    }
};

export const blendCharactersIntoScene = async (
    userImage: StoryPageImage,
    petImage: StoryPageImage,
    sceneImage: StoryPageImage,
    poiImage: StoryPageImage,
): Promise<StoryPageImage> => {
    try {
        const prompt = "Complete the prompts in the image, remove all the red boxes and text, make it seamless"

        const parts: Part[] = [
            { inlineData: { data: userImage.data, mimeType: userImage.mimeType } },
            { inlineData: { data: petImage.data, mimeType: petImage.mimeType } },
            { inlineData: { data: sceneImage.data, mimeType: sceneImage.mimeType } },
            { inlineData: { data: poiImage.data, mimeType: poiImage.mimeType } },
            { text: prompt },
        ];

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from scene blending.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API response did not include a blended scene image.");
        }

        return {
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };
    } catch (error) {
        console.error("Error blending characters into scene:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to blend scene: ${error.message}`);
        }
        throw new Error("An unknown error occurred during scene blending.");
    }
};

export const moveCharactersToNewScene = async (
  characterSceneImage: StoryPageImage,
  newBackgroundImage: StoryPageImage
): Promise<StoryPageImage> => {
    try {
        const prompt = "Complete the prompts in the image, remove all the red boxes and text, make it seamless";

        const parts: Part[] = [
            { inlineData: { data: characterSceneImage.data, mimeType: characterSceneImage.mimeType } },
            { inlineData: { data: newBackgroundImage.data, mimeType: newBackgroundImage.mimeType } },
            { text: prompt },
        ];

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from scene transition.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API response did not include a transitioned scene image.");
        }

        return {
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };
    } catch (error) {
        console.error("Error moving characters to new scene:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to transition scene: ${error.message}`);
        }
        throw new Error("An unknown error occurred during scene transition.");
    }
};

export const moveCharactersToNewSceneWithPOI = async (
  characterSceneImage: StoryPageImage,
  newBackgroundImage: StoryPageImage,
  poiImage: StoryPageImage,
  userImage: StoryPageImage,
  petImage: StoryPageImage,
  editPrompt?: string,
): Promise<StoryPageImage> => {
    try {
        const basePrompt = `Complete the prompts in the image, remove all the red boxes and text, make it seamless`;
        const finalPrompt = editPrompt ? `${editPrompt}. ${basePrompt}` : basePrompt;

        const parts: Part[] = [
            { inlineData: { data: userImage.data, mimeType: userImage.mimeType } },
            { inlineData: { data: petImage.data, mimeType: petImage.mimeType } },
            { inlineData: { data: characterSceneImage.data, mimeType: characterSceneImage.mimeType } },
            { inlineData: { data: newBackgroundImage.data, mimeType: newBackgroundImage.mimeType } },
            { inlineData: { data: poiImage.data, mimeType: poiImage.mimeType } },
            { text: finalPrompt },
        ];

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from scene transition with POI.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API response did not include a transitioned scene image.");
        }

        return {
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };
    } catch (error) {
        console.error("Error moving characters to new scene with POI:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to transition scene with POI: ${error.message}`);
        }
        throw new Error("An unknown error occurred during scene transition with POI.");
    }
};


export const blendPersonAndHidePet = async (
  characterSceneImage: StoryPageImage,
  newBackgroundImage: StoryPageImage,
  poiImage: StoryPageImage
): Promise<StoryPageImage> => {
    try {
        const prompt = "Complete the prompts in the image, remove all the red boxes and text, make it seamless";

        const parts: Part[] = [
            { inlineData: { data: characterSceneImage.data, mimeType: characterSceneImage.mimeType } },
            { inlineData: { data: newBackgroundImage.data, mimeType: newBackgroundImage.mimeType } },
            { inlineData: { data: poiImage.data, mimeType: poiImage.mimeType } },
            { text: prompt },
        ];

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from scene transition.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API response did not include a transitioned scene image.");
        }

        return {
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };
    } catch (error) {
        console.error("Error blending person and hiding pet:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to blend/hide characters: ${error.message}`);
        }
        throw new Error("An unknown error occurred during blend/hide operation.");
    }
};


export const moveCharactersToNewSceneAndEdit = async (
  characterSceneImage: StoryPageImage,
  newBackgroundImage: StoryPageImage,
  poiImage: StoryPageImage,
  editPrompt: string,
  userImage: StoryPageImage,
  petImage: StoryPageImage,
): Promise<StoryPageImage> => {
    try {
        const basePrompt = `Complete the prompts in the image, remove all the red boxes and text, make it seamless`;
        const finalPrompt = `${editPrompt}. ${basePrompt}`;

        const parts: Part[] = [
            { inlineData: { data: userImage.data, mimeType: userImage.mimeType } },
            { inlineData: { data: petImage.data, mimeType: petImage.mimeType } },
            { inlineData: { data: characterSceneImage.data, mimeType: characterSceneImage.mimeType } },
            { inlineData: { data: newBackgroundImage.data, mimeType: newBackgroundImage.mimeType } },
            { inlineData: { data: poiImage.data, mimeType: poiImage.mimeType } },
            { text: finalPrompt },
        ];

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from scene transition with edit.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API response did not include a transitioned and edited scene image.");
        }

        return {
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };
    } catch (error) {
        console.error("Error moving characters to new scene and editing:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to transition and edit scene: ${error.message}`);
        }
        throw new Error("An unknown error occurred during scene transition and edit.");
    }
};


export const generateImageFromImage = async (
    prompt: string, 
    image: StoryPageImage, 
    referenceImages?: { user: StoryPageImage, pet: StoryPageImage }
): Promise<StoryPageImage> => {
    try {
        const parts: Part[] = [];
        let finalPrompt = prompt;

        if (referenceImages) {
            // Add reference images first
            parts.push({ inlineData: { data: referenceImages.user.data, mimeType: referenceImages.user.mimeType } });
            parts.push({ inlineData: { data: referenceImages.pet.data, mimeType: referenceImages.pet.mimeType } });
            
            // The image to be edited is now the 3rd image
            parts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });

            // Prepend a consistency instruction to the prompt
            finalPrompt = `You are a master photo editor. You must perform an edit while maintaining character consistency. You are given three images: 1. A reference of the person. 2. A reference of the pet. 3. The image to be edited. The person and pet in the final image must look EXACTLY like their reference images. Now, follow this instruction for the edit: "${prompt}"`;
        } else {
            // Original behavior
            parts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
        }

        parts.push({ text: finalPrompt });


        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from image generation.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API response did not include a generated image.");
        }

        return {
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };
    } catch (error) {
        console.error("Error generating image from image:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate image: ${error.message}`);
        }
        throw new Error("An unknown error occurred during image generation.");
    }
};

export const generateStoryTextForImage = async (prompt: string, sceneImage: StoryPageImage): Promise<string> => {
  try {
    const parts: Part[] = [
      { inlineData: { data: sceneImage.data, mimeType: sceneImage.mimeType } },
      { text: prompt },
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: { parts },
      config: {
        responseModalities: [Modality.TEXT],
      },
    });

    if (!response.text) {
      throw new Error("No text was generated for the story page.");
    }

    return response.text;
  } catch (error) {
    console.error("Error generating story text:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate story text: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating story text.");
  }
};

export const revealPetInCircle = async (
  sceneWithHiddenPet: StoryPageImage,
  petImage: StoryPageImage,
  maskImage: StoryPageImage
): Promise<StoryPageImage> => {
    try {
        const prompt = "You are a master photo editor. You are given three images in order: 1. A scene where a pet is hidden. 2. A reference image of the hidden pet. 3. A mask image with a white ellipse. Your task is to reveal the pet from the reference image (image 2) inside the white ellipse area of the scene (image 1). The pet should be seamlessly blended into the scene and should appear to be interacting with the objects or environment within the circled area. The rest of the image should remain unchanged. The final output should be only the final, blended image.";

        const parts: Part[] = [
            { inlineData: { data: sceneWithHiddenPet.data, mimeType: sceneWithHiddenPet.mimeType } },
            { inlineData: { data: petImage.data, mimeType: petImage.mimeType } },
            { inlineData: { data: maskImage.data, mimeType: maskImage.mimeType } },
            { text: prompt },
        ];

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from pet reveal.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API response did not include a revealed pet image.");
        }

        return {
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };
    } catch (error) {
        console.error("Error revealing pet in circle:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to reveal pet: ${error.message}`);
        }
        throw new Error("An unknown error occurred during pet reveal.");
    }
};

export const generate3dFigureImage = async (
    characterSceneImage: StoryPageImage, 
    userImage: StoryPageImage, 
    petImage: StoryPageImage
): Promise<StoryPageImage> => {
    try {
        const prompt = `You are a master 3D artist. Your task is to create a photorealistic image of a 1/7 scale collectible figurine based on a character and pet. You are given three images in order: 1. The original scene containing the characters. 2. A definitive reference image of the person. 3. A definitive reference image of the pet. Using the second and third images as the absolute reference for the characters' appearances, create a single image of a high-quality figurine. The figurine should depict the person and pet standing together inside a room diorama, both waving happily at the viewer. The style must be hyper-realistic, mimicking a physical product photograph with realistic lighting and shadows.`;

        const parts: Part[] = [
            { inlineData: { data: characterSceneImage.data, mimeType: characterSceneImage.mimeType } },
            { inlineData: { data: userImage.data, mimeType: userImage.mimeType } },
            { inlineData: { data: petImage.data, mimeType: petImage.mimeType } },
            { text: prompt },
        ];

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from 3D figure generation.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API response did not include a generated 3D figure image.");
        }

        return {
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };
    } catch (error) {
        console.error("Error generating 3D figure image:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate 3D figure: ${error.message}`);
        }
        throw new Error("An unknown error occurred during 3D figure generation.");
    }
};

export const changeSceneForDressUp = async (
  newBackgroundImage: StoryPageImage,
  poiImage: StoryPageImage,
  userImage: StoryPageImage,
  petImage: StoryPageImage,
): Promise<StoryPageImage> => {
    try {
        const prompt = `You are a master photo editor. Your task is to place a specific person and pet into a new scene with a new pose. You are given images in this order: 1. A definitive reference image of the person. 2. A definitive reference image of the pet. 3. The new background. 4. A POI map for placement. Using ONLY the first two images as the absolute source for the characters' appearance (face, body, and original clothing), place them into the new background (image 3) according to the POI map (image 4, person to blue area, pet to green area). IMPORTANTLY, change the person's pose so they are looking forward at the viewer with a thoughtful expression, as if deciding what to wear. The pet should also look towards the viewer. The final characters must look EXACTLY like their reference images, just in the new pose. The POI map and any red boxes/text must not appear in the final output. Your final image must be a single, clean scene.`;

        const parts: Part[] = [
            { inlineData: { data: userImage.data, mimeType: userImage.mimeType } },
            { inlineData: { data: petImage.data, mimeType: petImage.mimeType } },
            { inlineData: { data: newBackgroundImage.data, mimeType: newBackgroundImage.mimeType } },
            { inlineData: { data: poiImage.data, mimeType: poiImage.mimeType } },
            { text: prompt },
        ];

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from dress-up scene change.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API response did not include a generated image for dress-up scene change.");
        }

        return {
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };
    } catch (error) {
        console.error("Error changing scene for dress-up:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to change scene for dress-up: ${error.message}`);
        }
        throw new Error("An unknown error occurred during dress-up scene change.");
    }
};