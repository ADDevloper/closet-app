
import React, { useState, useRef, useEffect } from 'react';
import { ClothingItem, Conversation, ChatMessage, OutfitSuggestion, ScheduledOutfit } from '../types';
import { Send, User, Sparkles, PlusCircle, MessageSquare, History, Clock, X, Calendar } from 'lucide-react';
import { getFashionAdvice } from '../services/gemini';
import OutfitDisplay from './OutfitDisplay';
import { generateId, formatDate } from '../utils';

interface ChatViewProps {
  closet: ClothingItem[];
  conversations: Conversation[];
  onSaveConversation: (conv: Conversation) => void;
  onScheduleOutfit: (outfit: OutfitSuggestion, date: string) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  todayOutfit?: ScheduledOutfit;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  closet, 
  conversations, 
  onSaveConversation, 
  onScheduleOutfit,
  activeConversationId, 
  setActiveConversationId,
  todayOutfit
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [schedulingOutfit, setSchedulingOutfit] = useState<OutfitSuggestion | null>(null);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConv?.messages, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const query = textOverride || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    let updatedConv: Conversation;
    if (!activeConv) {
      updatedConv = {
        id: generateId(),
        title: query.substring(0, 30),
        messages: [userMsg],
        lastUpdatedAt: Date.now()
      };
      setActiveConversationId(updatedConv.id);
    } else {
      updatedConv = {
        ...activeConv,
        messages: [...activeConv.messages, userMsg],
        lastUpdatedAt: Date.now()
      };
    }

    onSaveConversation(updatedConv);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getFashionAdvice(query, closet, updatedConv.messages);
      
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't process that request.",
        outfits: response.outfits,
        timestamp: Date.now()
      };

      onSaveConversation({
        ...updatedConv,
        messages: [...updatedConv.messages, assistantMsg],
        lastUpdatedAt: Date.now()
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setShowHistory(false);
  };

  const handleScheduleConfirm = () => {
    if (schedulingOutfit) {
      onScheduleOutfit(schedulingOutfit, scheduleDate);
      setSchedulingOutfit(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] relative">
      {/* Today's Plan Reminder */}
      {/* FIX: Removed undefined activeTab reference. ChatView is only rendered in the home tab by App.tsx */}
      {todayOutfit && (
        <div className="mb-4 p-3 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl text-white shadow-md flex items-center justify-between animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Today's Look</p>
              <h4 className="text-sm font-semibold">{todayOutfit.outfit.name}</h4>
            </div>
          </div>
          <button 
            onClick={() => {/* Navigate to details if needed */}}
            className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition"
          >
            View
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition md:hidden"
          >
            <History size={20} />
          </button>
          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-500" />
              Closet AI
            </h2>
            <p className="text-xs text-gray-400">Styling assistant online</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={startNewChat}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition"
          >
            <PlusCircle size={16} />
            <span>New Session</span>
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200 transition"
          >
            <History size={16} />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat History Sidebar (Desktop) */}
        <div className="hidden lg:flex w-64 flex-col bg-white border border-gray-100 rounded-3xl p-4 overflow-hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock size={14} />
            Past Chats
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {conversations.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-8">No history yet</p>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-3 rounded-2xl transition group ${activeConversationId === conv.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <p className="text-xs font-bold line-clamp-1">{conv.title}</p>
                  <p className={`text-[10px] mt-1 ${activeConversationId === conv.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {formatDate(conv.lastUpdatedAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col min-h-0 bg-white md:bg-transparent md:border-0 border border-gray-100 rounded-3xl md:p-0 p-4 shadow-sm md:shadow-none">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 scroll-smooth"
          >
            {!activeConv || activeConv.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                  <Sparkles size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Your AI Stylist</h3>
                <p className="text-gray-500 max-w-sm mt-3 text-sm">
                  Ready to plan your next look? I can suggest outfits from your closet or give general advice.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 w-full max-w-lg">
                  {[
                    'What should I wear to a wedding?', 
                    'Outfit for a rainy casual day', 
                    'Style my favorite jacket', 
                    'Suggest something bold'
                  ].map(hint => (
                    <button 
                      key={hint}
                      onClick={() => handleSend(hint)}
                      className="text-xs text-left px-5 py-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition text-gray-700 shadow-sm"
                    >
                      &quot;{hint}&quot;
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeConv.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gray-100 text-gray-500' : 'bg-indigo-600 text-white'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className="flex flex-col">
                      <div className={`px-5 py-3.5 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100/50' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.outfits && msg.outfits.length > 0 && (
                        <OutfitDisplay 
                          outfits={msg.outfits} 
                          closet={closet} 
                          onFavorite={() => {}} 
                          onSchedule={setSchedulingOutfit}
                        />
                      )}
                      <span className="text-[9px] font-bold text-gray-300 mt-1 px-1 uppercase tracking-tight">
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                    <Sparkles size={16} />
                  </div>
                  <div className="bg-white border border-gray-100 px-5 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="relative mt-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message your stylist..."
              className="w-full bg-white border border-gray-100 rounded-2xl py-4.5 pl-6 pr-14 shadow-xl shadow-gray-200/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition placeholder-gray-400 text-sm"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-black disabled:opacity-30 transition shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* History Mobile Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-white p-6 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-800">History</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 bg-gray-50 rounded-lg"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setShowHistory(false);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition ${activeConversationId === conv.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-700'}`}
                >
                  <p className="text-sm font-bold line-clamp-2">{conv.title}</p>
                  <p className={`text-[10px] mt-1 ${activeConversationId === conv.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {formatDate(conv.lastUpdatedAt)}
                  </p>
                </button>
              ))}
              {conversations.length === 0 && <p className="text-center text-gray-400 py-12 text-sm italic">No chats yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Selection Modal */}
      {schedulingOutfit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSchedulingOutfit(null)}></div>
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Schedule Outfit</h3>
            <p className="text-sm text-gray-500 mb-6">Plan to wear "{schedulingOutfit.name}" on:</p>
            
            <div className="space-y-4">
              <input 
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none font-semibold text-gray-700"
              />
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setSchedulingOutfit(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleScheduleConfirm}
                  className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 text-sm"
                >
                  Schedule Look
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatView;
