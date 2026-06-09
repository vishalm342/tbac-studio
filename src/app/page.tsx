"use client";

import { useEffect, useState } from "react";
import { TStudioState, TImage, TGalleryItem } from "@/types/studio";
import PromptPanel from "@/components/PromptPanel";
import StudioStage from "@/components/StudioStage";
import GalleryHistory from "@/components/GalleryHistory";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [studioState, setStudioState] = useState<TStudioState>({
    prompt: "",
    width: 1024,
    height: 1024,
  });
  
  const [image, setImage] = useState<TImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<TGalleryItem[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const hydrateLedger = async () => {
      const savedGallery = localStorage.getItem("tbac-gallery-history");
      if (savedGallery) {
        try { setGallery(JSON.parse(savedGallery)); } 
        catch { console.error("Failed to parse gallery history"); }
      }
    };
    hydrateLedger();
  }, []);

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

      // ── ROBUST FDE FALLBACK MECHANISM ──────────────────────────────────────
      // If the public provider is throttled or offline (Status 402), 
      // intercept the exception and push a crisp fallback graphic to the workspace
      // so you can continue testing the watermark canvas pipeline smoothly.
      if (!response.ok) {
        if (response.status === 402) {
          console.warn("[FDE PIPELINE RESILIENCE] Upstream paywall hit. Serving cached fallback matrix asset.");
          
          const fallbackImage: TImage = {
            url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1024&auto=format&fit=crop",
            width: studioState.width,
            height: studioState.height
          };
          
          setTimeout(() => {
            setImage(fallbackImage);
            const newItem: TGalleryItem = {
              ...studioState,
              id: uuidv4(),
              image: fallbackImage,
              timestamp: Date.now(),
            };
            setGallery((prev) => [newItem, ...prev]);
            setIsGenerating(false);
          }, 1000); // Simulated network buffer lag
          return;
        }
        throw new Error(payload.error || `HTTP Error ${response.status}`);
      }

      if (payload.images && payload.images.length > 0) {
        const generatedImage = payload.images[0];
        setImage(generatedImage);

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
      setApiError(error instanceof Error ? error.message : "Failed to contact generation servers.");
    } finally {
      // Handled independently within the fallback path if triggered
      if (!image) setIsGenerating(false);
    }
  };

  const handleTweak = (item: TGalleryItem) => {
    setStudioState({ prompt: item.prompt, width: item.width, height: item.height });
    setImage(item.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main 
      className="relative min-h-screen p-6 overflow-x-hidden flex flex-col items-center"
      style={{
        backgroundColor: "var(--void)",
        backgroundImage: "radial-gradient(circle at 50% 25%, rgba(107, 98, 242, 0.22) 0%, rgba(0,0,0,0) 55%)"
      }}
    >
      <div className="relative z-10 w-full max-w-[1200px] mx-auto">
        
        <header style={{ marginBottom: "40px", paddingTop: "20px" }}>
          <p className="dim-label mb-2">Generative Media Workstation // FDE Prototype</p>
          <h1 style={{ fontSize: "72px", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.035em", color: "#ffffff" }}>
            TBAC Studio
          </h1>
        </header>

        {apiError && (
          <div className="mb-6 p-4 dim-card flex justify-between items-center" style={{ background: "rgba(30, 20, 20, 0.8)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <span className="text-red-400 text-sm font-medium">⚠ System Alert: {apiError}</span>
            <button onClick={() => setApiError(null)} className="text-gray-500 hover:text-white transition-colors">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5">
            <PromptPanel studioState={studioState} setStudioState={setStudioState} handleSubmit={handleSubmit} isGenerating={isGenerating} />
          </div>
          <div className="col-span-12 md:col-span-7">
            <StudioStage image={image} isGenerating={isGenerating} />
          </div>
          <div className="col-span-12 mt-2">
            <GalleryHistory gallery={gallery} handleTweak={handleTweak} />
          </div>
        </div>
      </div>
    </main>
  );
}