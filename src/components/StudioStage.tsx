import { useState, useRef, useEffect } from "react";
import { TImage } from "@/types/studio";

type Props = {
  image: TImage | null;
  isGenerating: boolean;
};

export default function StudioStage({ image, isGenerating }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [overlayText, setOverlayText] = useState("");

  // Bonus Feature: Draw image and text to HTML5 Canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    
    // The cleanup flag prevents stale memory draws
    let isMounted = true;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.url;
    img.onload = () => {
      // Guard clause: if the component unmounted, stop drawing
      if (!isMounted) return;

      // Set canvas to match image dimensions exactly
      canvas.width = image.width || 1024;
      canvas.height = image.height || 1024;
      
      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw text overlay if provided
      if (overlayText.trim()) {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 8;
        ctx.textAlign = "center";
        
        // Scale font size based on image width
        const fontSize = Math.floor(canvas.width * 0.08); 
        ctx.font = `bold ${fontSize}px sans-serif`;
        
        const x = canvas.width / 2;
        const y = canvas.height - (canvas.height * 0.1); // Bottom 10%

        ctx.strokeText(overlayText.toUpperCase(), x, y);
        ctx.fillText(overlayText.toUpperCase(), x, y);
      }
    };

    // This cleanup function runs right before the next useEffect execution
    return () => {
      isMounted = false;
    };
  }, [image, overlayText]);

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `tbac-studio-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl min-h-[600px] flex flex-col">
      <h2 className="text-lg font-bold text-gray-100 mb-4">Output Stage</h2>
      
      <div className="flex-1 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative flex items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-400 font-medium">Synthesizing Latent Space...</p>
          </div>
        ) : image ? (
          <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
        ) : (
          <p className="text-gray-500">Awaiting generation command.</p>
        )}
      </div>

      {image && !isGenerating && (
        <div className="mt-4 flex gap-4">
          <input 
            type="text" 
            placeholder="Type to overlay watermark / text..." 
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-white"
          />
          <button 
            onClick={downloadCanvas}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Export Asset
          </button>
        </div>
      )}
    </div>
  );
}