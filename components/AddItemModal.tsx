
import React, { useState, useRef, useEffect } from 'react';
import { ClothingItem, Category, CATEGORIES, Occasion, OCCASIONS, Season, SEASONS } from '../types';
import { X, Camera, Upload, Check, Loader2, Wand2 } from 'lucide-react';
import { analyzeClothingImage } from '../services/gemini';
import { compressImage, generateId } from '../utils';

interface AddItemModalProps {
  onClose: () => void;
  onSave: (item: ClothingItem) => void;
  editItem?: ClothingItem;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onSave, editItem }) => {
  const [photo, setPhoto] = useState<string>(editItem?.photo || '');
  const [category, setCategory] = useState<Category>(editItem?.category || 'shirt');
  const [colors, setColors] = useState<string[]>(editItem?.colors || []);
  const [occasions, setOccasions] = useState<Occasion[]>(editItem?.occasions || []);
  const [seasons, setSeasons] = useState<Season[]>(editItem?.seasons || []);
  const [brand, setBrand] = useState(editItem?.brand || '');
  const [size, setSize] = useState(editItem?.size || '');
  const [purchaseDate, setPurchaseDate] = useState(editItem?.purchaseDate || '');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setPhoto(compressed);
        autoDetect(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const autoDetect = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeClothingImage(base64);
      setCategory(result.category);
      setColors(result.colors);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleOccasion = (occ: Occasion) => {
    setOccasions(prev => prev.includes(occ) ? prev.filter(o => o !== occ) : [...prev, occ]);
  };

  const handleToggleSeason = (sea: Season) => {
    setSeasons(prev => prev.includes(sea) ? prev.filter(s => s !== sea) : [...prev, sea]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return;

    const newItem: ClothingItem = {
      id: editItem?.id || generateId(),
      photo,
      category,
      colors,
      occasions,
      seasons,
      brand,
      size,
      purchaseDate,
      createdAt: editItem?.createdAt || Date.now()
    };
    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition shadow-sm"
        >
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col h-[90vh] md:h-auto max-h-[90vh]">
          <div className="p-6 overflow-y-auto flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{editItem ? 'Edit Item' : 'Add New Item'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Side */}
              <div className="flex flex-col gap-4">
                <div className="relative aspect-[3/4] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group">
                  {photo ? (
                    <>
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                        >
                          Change Photo
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center px-6">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mx-auto mb-4 text-gray-400">
                        <Camera size={32} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Snap a photo of your item</p>
                      <p className="text-xs text-gray-400 mt-1">or upload from your gallery</p>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition"
                      >
                        Upload Image
                      </button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>

                {isAnalyzing && (
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <Loader2 size={18} className="text-indigo-600 animate-spin" />
                    <span className="text-sm font-medium text-indigo-700">AI is analyzing your style...</span>
                  </div>
                )}
                
                {!isAnalyzing && photo && (
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500 justify-center">
                    <Wand2 size={14} />
                    <span>AI auto-detected detected</span>
                  </div>
                )}
              </div>

              {/* Form Side */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition capitalize"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-gray-200" style={{ backgroundColor: color.toLowerCase() }}></div>
                        {color}
                        <button type="button" onClick={() => setColors(prev => prev.filter((_, idx) => idx !== i))}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => {
                        const c = prompt('Enter a color');
                        if (c) setColors([...colors, c]);
                      }}
                      className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-xs font-medium text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Occasions</label>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map(occ => (
                      <button 
                        key={occ}
                        type="button"
                        onClick={() => handleToggleOccasion(occ)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${occasions.includes(occ) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Seasons</label>
                  <div className="flex flex-wrap gap-2">
                    {SEASONS.map(sea => (
                      <button 
                        key={sea}
                        type="button"
                        onClick={() => handleToggleSeason(sea)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${seasons.includes(sea) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {sea}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Brand</label>
                    <input 
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Nike, Zara..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Size</label>
                    <input 
                      type="text"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="M, 42..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-gray-600 font-semibold rounded-2xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!photo || isAnalyzing}
              className="flex-[2] py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              <Check size={20} />
              <span>Save to Closet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
