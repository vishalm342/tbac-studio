"use client";

import { useState } from "react";
import { TStudioState, TImage, TGalleryItem } from "@/types/studio";
import PromptPanel from "@/components/PromptPanel";
import StudioStage from "@/components/StudioStage";
import GalleryHistory from "@/components/GalleryHistory";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  // Master State
  const [studioState, setStudioState] = useState<TStudioState>({
    prompt: "",
    width: 1024,
    height: 1024,
  });
  
  const [image, setImage] = useState<TImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<TGalleryItem[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsGenerating(true);
    setApiError(null); // Clear previous errors
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studioState),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || `HTTP Error ${response.status}`);
      }

      if (payload.images && payload.images.length > 0) {
        const generatedImage = payload.images[0];
        setImage(generatedImage);

        // Save to ledger
        const newItem: TGalleryItem = {
          ...studioState,
          id: uuidv4(),
          image: generatedImage,
          timestamp: Date.now(),
        };
        setGallery((prev) => [newItem, ...prev]);
      }
    } catch (error: unknown) {
      console.error("Network Exception:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to contact generation servers.";
      setApiError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTweak = (item: TGalleryItem) => {
    // Load config into panel, ignoring the id and timestamp
    setStudioState({
      prompt: item.prompt,
      width: item.width,
      height: item.height,
    });
    // Set stage to the historical image
    setImage(item.image);
    // Auto-scroll to top on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white p-4 md:p-8 selection:bg-blue-500/30">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-100">TBAC<span className="text-blue-500">.Studio</span></h1>
        <p className="text-sm text-gray-400 mt-1">Generative Media Workstation // FDE Prototype</p>
      </header>

      {/* Unhappy Path: Visual Error Toast */}
      {apiError && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm font-medium flex items-center justify-between">
          <span>⚠️ System Alert: {apiError}</span>
          <button onClick={() => setApiError(null)} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        {/* Left Column: Controls */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <PromptPanel 
            studioState={studioState} 
            setStudioState={setStudioState} 
            handleSubmit={handleSubmit} 
            isGenerating={isGenerating} 
          />
        </div>

        {/* Center Column: The Stage */}
        <div className="w-full lg:w-2/4 flex-1">
          <StudioStage 
            image={image} 
            prompt={studioState.prompt} 
            isGenerating={isGenerating} 
          />
        </div>

        {/* Right Column: Ledger */}
        <div className="w-full lg:w-1/4 hidden lg:block">
          <GalleryHistory gallery={gallery} handleTweak={handleTweak} />
        </div>
      </div>
    </main>
  );
}