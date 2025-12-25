
import React from 'react';
import { OutfitSuggestion, ClothingItem } from '../types';
import { Heart, CalendarPlus, ChevronRight } from 'lucide-react';

interface OutfitDisplayProps {
  outfits: OutfitSuggestion[];
  closet: ClothingItem[];
  onFavorite: (outfit: OutfitSuggestion) => void;
  onSchedule: (outfit: OutfitSuggestion) => void;
}

const OutfitDisplay: React.FC<OutfitDisplayProps> = ({ outfits, closet, onFavorite, onSchedule }) => {
  return (
    <div className="flex flex-col gap-4 mt-4 overflow-x-auto pb-4 no-scrollbar">
      <div className="flex gap-4 min-w-max">
        {outfits.map((outfit, idx) => {
          const items = outfit.itemIds.map(id => closet.find(c => c.id === id)).filter(Boolean) as ClothingItem[];
          
          return (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm w-72 flex flex-col overflow-hidden group">
              <div className="p-4 border-b border-gray-50">
                <h4 className="font-semibold text-gray-800 line-clamp-1 flex items-center justify-between">
                  {outfit.name}
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-600 transition" />
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">{outfit.description}</p>
              </div>

              {/* Visual Layout */}
              <div className="p-4 flex-1 bg-gray-50/50">
                <div className="grid grid-cols-2 gap-2">
                  {items.map((item, i) => (
                    <div key={item.id} className={`aspect-square rounded-xl overflow-hidden border border-white shadow-sm ${items.length === 1 ? 'col-span-2 h-44' : (items.length === 3 && i === 0) ? 'row-span-2 h-full' : ''}`}>
                      <img src={item.photo} alt={item.category} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="col-span-2 aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                      No items available
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white space-y-4">
                <div className="text-[11px] text-gray-600 italic leading-relaxed bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-50/50">
                  &quot;{outfit.stylingTips}&quot;
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onSchedule(outfit)}
                    className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 py-2.5 rounded-xl transition"
                  >
                    <CalendarPlus size={14} />
                    <span>Schedule</span>
                  </button>
                  <button 
                    onClick={() => onFavorite(outfit)}
                    className="p-2.5 rounded-xl text-pink-500 bg-pink-50 hover:bg-pink-100 transition"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OutfitDisplay;
