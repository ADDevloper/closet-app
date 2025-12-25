
import React from 'react';
import { Home, Grid, Plus, Shirt, Calendar } from 'lucide-react';
import { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddClick }) => {
  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-0 md:pt-16 bg-[#fcfcfd]">
      {/* Header (Desktop) */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 items-center justify-between px-8 z-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Shirt size={22} />
          </div>
          <span className="text-xl font-bold text-gray-800 poppins">Closet AI</span>
        </div>
        
        <nav className="flex items-center gap-2">
          {[
            { id: 'home', label: 'Chat Assistant', icon: Home },
            { id: 'closet', label: 'My Closet', icon: Grid },
            { id: 'calendar', label: 'Schedule', icon: Calendar },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${activeTab === tab.id ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={onAddClick}
          className="bg-gray-900 text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-black transition shadow-sm font-medium"
        >
          <Plus size={18} />
          <span>Add Item</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-4">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
        >
          <Home size={22} />
          <span className="text-[10px] font-bold uppercase">Home</span>
        </button>
        
        <button 
          onClick={() => onTabChange('calendar')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'calendar' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
        >
          <Calendar size={22} />
          <span className="text-[10px] font-bold uppercase">Plan</span>
        </button>
        
        <button 
          onClick={onAddClick}
          className="mb-8 w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>

        <button 
          onClick={() => onTabChange('closet')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'closet' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
        >
          <Grid size={22} />
          <span className="text-[10px] font-bold uppercase">Closet</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
