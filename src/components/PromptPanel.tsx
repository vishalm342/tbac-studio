import React from "react";
import { TStudioState } from "@/types/studio";

type Props = {
  studioState: TStudioState;
  setStudioState: React.Dispatch<React.SetStateAction<TStudioState>>;
  handleSubmit: () => void;
  isGenerating: boolean;
};

export default function PromptPanel({ studioState, setStudioState, handleSubmit, isGenerating }: Props) {
  // Simple boolean check
  const isDisabled = isGenerating || !studioState.prompt || studioState.prompt.trim() === "";

  return (
    <div className="dim-card flex flex-col gap-6 h-full">
      <div>
        <h2 style={{ color: "var(--bone)", fontSize: "0.9375rem", fontWeight: 500 }}>Control Matrix</h2>
        <p style={{ color: "var(--fog)", fontSize: "0.75rem", marginTop: "4px" }}>Define your generation parameters.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="dim-label">Primary Descriptor</label>
        <textarea
          value={studioState.prompt}
          onChange={(e) => setStudioState({ ...studioState, prompt: e.target.value })}
          className="dim-textarea w-full p-4"
          style={{ minHeight: "140px" }}
          placeholder="e.g., A cinematic shot of a neon cyberpunk city, 8k resolution..."
          disabled={isGenerating ? true : undefined}
          suppressHydrationWarning
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-2">
          <label className="dim-label">Width</label>
          <input
            type="number"
            value={studioState.width}
            onChange={(e) => setStudioState({ ...studioState, width: Number(e.target.value) })}
            className="dim-input text-center w-full px-3 py-2"
            disabled={isGenerating ? true : undefined}
            suppressHydrationWarning
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="dim-label">Height</label>
          <input
            type="number"
            value={studioState.height}
            onChange={(e) => setStudioState({ ...studioState, height: Number(e.target.value) })}
            className="dim-input text-center w-full px-3 py-2"
            disabled={isGenerating ? true : undefined}
            suppressHydrationWarning
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="dim-label">Steps</label>
          <input
            type="number"
            value={studioState.numInferenceSteps ?? 30}
            onChange={(e) => setStudioState({ ...studioState, numInferenceSteps: Number(e.target.value) })}
            className="dim-input text-center w-full px-3 py-2"
            disabled={isGenerating ? true : undefined}
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="dim-divider" />

      <button 
        onClick={handleSubmit} 
        disabled={isDisabled ? true : undefined} 
        suppressHydrationWarning
        className="dim-btn-primary w-full py-3 px-6 mt-auto"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Asset...
          </>
        ) : (
          "Execute Build Command"
        )}
      </button>
    </div>
  );
}