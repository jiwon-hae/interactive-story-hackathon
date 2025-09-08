import type { StoryPageImage } from '../types';

const getMimeTypeFromUrl = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        default:
            return ''; // Fallback for unsupported types
    }
};

export const urlToStoryPageImage = async (url: string): Promise<StoryPageImage> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
    }
    const blob = await response.blob();
    
    // Use the blob's type if available, otherwise guess from the URL's extension.
    // This is a fallback for development servers that might not send correct Content-Type headers.
    const mimeType = blob.type || getMimeTypeFromUrl(url);

    if (!mimeType) {
        throw new Error(`Could not determine a valid MIME type for the image at ${url}.`);
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            if (base64Data) {
                resolve({ data: base64Data, mimeType });
            } else {
                reject(new Error("Could not read image file from URL."));
            }
        };
        reader.onerror = () => {
            reject(new Error("Failed to read file from URL."));
        };
        reader.readAsDataURL(blob);
    });
};
