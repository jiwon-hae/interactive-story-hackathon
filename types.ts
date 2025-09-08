
export interface StoryPageImage {
  data: string; // base64 encoded image data
  mimeType: string;
}

export interface StoryPage {
  id: string;
  text: string;
  image: StoryPageImage;
}
