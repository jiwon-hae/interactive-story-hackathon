import React, { useState, useRef } from 'react';
import type { StoryPageImage } from '../types';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploadProps {
  label: string;
  Icon: React.FC<{className?: string}>;
  onImageUpload: (image: StoryPageImage | null) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, Icon, onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      setError('Please upload a JPG or PNG file.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      // data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
      const base64Data = result.split(',')[1];
      if (base64Data) {
        onImageUpload({ data: base64Data, mimeType: file.type });
      } else {
        setError("Could not read image file.");
        onImageUpload(null);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      onImageUpload(null);
    }
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div className="w-full p-4 bg-white/60 rounded-2xl shadow-lg backdrop-blur-sm border border-amber-200 text-center">
      <h3 className="text-3xl font-bold font-sans text-amber-800">{label}</h3>
      <div className="mt-4 aspect-square w-full rounded-lg border-2 border-dashed border-amber-300 flex items-center justify-center overflow-hidden bg-amber-50/50">
        {preview ? (
            <div className="relative w-full h-full group">
                <img src={preview} alt="Upload preview" className="w-full h-full object-contain" />
                <button 
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors">
            <Icon className="w-16 h-16" />
            <span className="mt-2 font-sans font-semibold text-lg">Click to upload</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg, image/png"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};