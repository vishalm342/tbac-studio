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

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.src = image.url;

    img.onload = () => {
      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 1024;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (overlayText.trim()) {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 6;
        ctx.textAlign = "center";
        const fontSize = Math.floor(canvas.width * 0.06);
        ctx.font = `800 ${fontSize}px sans-serif`;
        const x = canvas.width / 2;
        const y = canvas.height - canvas.height * 0.08;
        ctx.strokeText(overlayText.toUpperCase(), x, y);
        ctx.fillText(overlayText.toUpperCase(), x, y);
      }
    };
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
    <div className="dim-card flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="dim-label">OUTPUT STAGE</h2>
        {image && !isGenerating && (
          <span className="text-xs text-green-400 tracking-widest">RENDER COMPLETE</span>
        )}
      </div>

      <div
        className="relative flex items-center justify-center rounded-lg overflow-hidden"
        style={{
          minHeight: "320px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {isGenerating ? (
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
            <span className="text-sm text-white/50 tracking-widest">
              SYNTHESIZING LATENT SPACE...
            </span>
          </div>
        ) : image ? (
          <>
            {/* Visible image display */}
            <img
              src={image.url}
              alt="Generated output"
              className="w-full h-full object-contain rounded-lg"
              style={{ maxHeight: "480px" }}
            />
            {/* Hidden canvas for export with overlay */}
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/20"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-sm text-white/30 tracking-widest">
              AWAITING GENERATION COMMAND.
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Generate an asset to enable overlays..."
          value={overlayText}
          onChange={(e) => setOverlayText(e.target.value)}
          className="dim-input flex-1 px-4 py-2"
          disabled={isControlsDisabled ? true : undefined}
          suppressHydrationWarning
        />
        <button
          onClick={downloadCanvas}
          disabled={isControlsDisabled ? true : undefined}
          className="dim-btn-secondary px-4 py-2"
          suppressHydrationWarning
        >
          Export Asset
        </button>
      </div>
    </div>
  );
}