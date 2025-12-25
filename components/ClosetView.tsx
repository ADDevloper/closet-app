
import React, { useState } from 'react';
import { ClothingItem, CATEGORIES, Category, OCCASIONS, Occasion, SEASONS, Season } from '../types';
import { Search, Filter, Trash2, Edit3, X } from 'lucide-react';

interface ClosetViewProps {
  items: ClothingItem[];
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ClothingItem) => void;
}

const ClosetView: React.FC<ClosetViewProps> = ({ items, onDeleteItem, onEditItem }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [activeOccasion, setActiveOccasion] = useState<Occasion | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.category.includes(search.toLowerCase()) || 
                         (item.brand?.toLowerCase().includes(search.toLowerCase())) ||
                         item.colors.some(c => c.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesOccasion = activeOccasion === 'all' || item.occasions.includes(activeOccasion as Occasion);

    return matchesSearch && matchesCategory && matchesOccasion;
  });

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Closet</h2>
          <p className="text-gray-500">{items.length} items collected</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search clothes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition ${showFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-100'}`}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Category</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${activeCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition capitalize ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Occasion</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setActiveOccasion('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${activeOccasion === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  All
                </button>
                {OCCASIONS.map(occ => (
                  <button 
                    key={occ}
                    onClick={() => setActiveOccasion(occ)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition capitalize ${activeOccasion === occ ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No items found</h3>
          <p className="text-gray-400 mt-1">Try changing your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={item.photo} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{item.category}</span>
                  <div className="flex gap-1">
                    {item.colors.slice(0, 2).map((c, i) => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: c.toLowerCase() }}></span>
                    ))}
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.brand || 'No Brand'}</h4>
              </div>

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                <button 
                  onClick={() => onEditItem(item)}
                  className="w-10 h-10 bg-white text-gray-700 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition transform translate-y-2 group-hover:translate-y-0 duration-300"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => onDeleteItem(item.id)}
                  className="w-10 h-10 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition transform translate-y-2 group-hover:translate-y-0 duration-300 delay-[50ms]"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClosetView;
