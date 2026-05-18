import { TGalleryItem } from "@/types/studio";
import Image from "next/image";

type Props = {
  gallery: TGalleryItem[];
  handleTweak: (item: TGalleryItem) => void;
};

export default function GalleryHistory({ gallery, handleTweak }: Props) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl h-full overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-100 mb-4">Generation Ledger</h2>
      
      {gallery.length === 0 ? (
        <p className="text-xs text-gray-500 text-center mt-10">No assets in history.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 group relative">
              <div className="relative w-full h-32 mb-2">
                <Image 
                  src={item.image.url} 
                  alt="History thumbnail" 
                  fill
                  className="object-cover rounded-md"
                  unoptimized={item.image.url.startsWith('data:') || item.image.url.startsWith('http')}
                />
              </div>
              <p className="text-xs text-gray-400 truncate mb-2">&quot;{item.prompt}&quot;</p>
              
              <button 
                onClick={() => handleTweak(item)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Load Tweak Settings
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}