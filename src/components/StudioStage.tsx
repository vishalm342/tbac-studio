import { useState, useRef, useEffect } from "react";
import { TImage } from "@/types/studio";

type Props = {
  image: TImage | null;
  isGenerating: boolean;
};

export default function StudioStage({ image, isGenerating }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [overlayText, setOverlayText] = useState("");

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    
    let isMounted = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.url;
    
    img.onload = () => {
      if (!isMounted) return;
      
      canvas.width = image.width || 1024;
      canvas.height = image.height || 1024;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      if (overlayText.trim()) {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 6;
        ctx.textAlign = "center";
        
        const fontSize = Math.floor(canvas.width * 0.06); 
        ctx.font = `800 ${fontSize}px sans-serif`;
        
        const x = canvas.width / 2;
        const y = canvas.height - (canvas.height * 0.08);
        
        ctx.strokeText(overlayText.toUpperCase(), x, y);
        ctx.fillText(overlayText.toUpperCase(), x, y);
      }
    };
    
    return () => { isMounted = false; };
  }, [image, overlayText]);

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `jinxed-creative-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const isControlsDisabled = !image || isGenerating;

  return (
    <div className="dim-card flex flex-col h-full" style={{ minHeight: "500px" }}>
      <div className="flex justify-between items-center mb-4">
        <h2 style={{ color: "var(--bone)", fontSize: "0.9375rem", fontWeight: 500 }}>Output Stage</h2>
        {image && !isGenerating && (
           <span className="dim-label text-green-400/80">RENDER COMPLETE</span>
        )}
      </div>

      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden rounded-[16px]" 
        style={{ background: "rgba(0,0,0,0.4)", border: "1px solid var(--hairline)" }}
      >
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: "2px solid rgba(229,229,229,0.1)", borderTopColor: "rgba(229,229,229,0.5)" }} />
            <p className="dim-label">Synthesizing Latent Space...</p>
          </div>
        ) : image ? (
          <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
        ) : (
          <div className="flex flex-col items-center gap-3 select-none opacity-40">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <p className="dim-label">Awaiting generation command.</p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-[var(--hairline)] flex gap-3 items-center">
        <input 
          type="text" 
          placeholder={image && !isGenerating ? "Type to overlay text/watermark..." : "Generate an asset to enable overlays..."}
          value={overlayText} 
          onChange={(e) => setOverlayText(e.target.value)} 
          className="dim-input flex-1 px-4 py-2" 
          disabled={isControlsDisabled ? true : undefined}
          suppressHydrationWarning
        />
        <button 
          onClick={downloadCanvas} 
          disabled={isControlsDisabled ? true : undefined}
          suppressHydrationWarning
          className="dim-btn-secondary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export Asset
        </button>
      </div>
    </div>
  );
}