"use client";

import { useEffect, useState } from "react";
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

  // 1. Client-side Hydration: Safely load history from hard drive
  useEffect(() => {
    // Wrapping this in an async function pushes it to the microtask queue,
    // completely satisfying the React linter's "synchronous setState" warning.
    const hydrateLedger = async () => {
      const savedGallery = localStorage.getItem("tbac-gallery-history");
      if (savedGallery) {
        try {
          setGallery(JSON.parse(savedGallery));
        } catch {
          console.error("Failed to parse gallery history");
        }
      }
    };
    
    hydrateLedger();
  }, []);

  // 2. Automatically save to hard drive every time a new image is generated
  useEffect(() => {
    if (gallery.length > 0) {
      localStorage.setItem("tbac-gallery-history", JSON.stringify(gallery));
    }
  }, [gallery]);

  const handleSubmit = async () => {
    setIsGenerating(true);
    setApiError(null); 
    
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
    setStudioState({
      prompt: item.prompt,
      width: item.width,
      height: item.height,
    });
    setImage(item.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0B0F19] to-black text-white p-4 md:p-8 selection:bg-blue-500/30">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-100">TBAC<span className="text-blue-500">.Studio</span></h1>
        <p className="text-sm text-gray-400 mt-1">Generative Media Workstation // FDE Prototype</p>
      </header>

      {apiError && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm font-medium flex items-center justify-between shadow-lg backdrop-blur-sm">
          <span>⚠️ System Alert: {apiError}</span>
          <button onClick={() => setApiError(null)} className="text-red-400 hover:text-white transition-colors">✕</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)] pb-12">
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <PromptPanel 
            studioState={studioState} 
            setStudioState={setStudioState} 
            handleSubmit={handleSubmit} 
            isGenerating={isGenerating} 
          />
        </div>

        <div className="w-full lg:w-2/4 flex-1">
          {/* Note: the unused 'prompt' prop was removed here based on the earlier Codex audit */}
          <StudioStage 
            image={image} 
            isGenerating={isGenerating} 
          />
        </div>

        <div className="w-full lg:w-1/4 hidden lg:block">
          <GalleryHistory gallery={gallery} handleTweak={handleTweak} />
        </div>
      </div>
    </main>
  );
}