import { TStudioState } from "@/types/studio";

type Props = {
  studioState: TStudioState;
  setStudioState: (state: TStudioState) => void;
  handleSubmit: () => void;
  isGenerating: boolean;
};

export default function PromptPanel({ studioState, setStudioState, handleSubmit, isGenerating }: Props) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-gray-100">Control Matrix</h2>
        <p className="text-xs text-gray-400 mt-1">Define your generation parameters.</p>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-300 font-medium">Primary Descriptor</label>
        <textarea 
          value={studioState.prompt}
          onChange={(e) => setStudioState({ ...studioState, prompt: e.target.value })}
          className="bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none"
          placeholder="e.g., A cinematic shot of a neon cyberpunk city, 8k resolution..."
          disabled={isGenerating}
        />
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isGenerating || !studioState.prompt.trim()}
        className={`mt-2 py-3 px-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
          isGenerating || !studioState.prompt.trim() 
            ? 'bg-blue-600/40 cursor-not-allowed text-gray-300' 
            : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
        }`}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Asset...
          </>
        ) : (
          'Execute Build Command'
        )}
      </button>
    </div>
  );
}