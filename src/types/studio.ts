export type TImage = {
  url: string;
  width?: number;
  height?: number;
};

export type TStudioState = {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  numInferenceSteps?: number;
  seed?: number;
};

export type TGalleryItem = TStudioState & {
  id: string;
  image: TImage;
  timestamp: number;
};