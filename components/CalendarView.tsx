
import React, { useState } from 'react';
import { ScheduledOutfit, ClothingItem } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Clock } from 'lucide-react';

interface CalendarViewProps {
  scheduled: ScheduledOutfit[];
  closet: ClothingItem[];
  onDeleteSchedule: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ scheduled, closet, onDeleteSchedule }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const numDays = daysInMonth(year, month);
  const startDay = startDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const getScheduledForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return scheduled.filter(s => s.date === dateStr);
  };

  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const activeSchedules = selectedDay ? getScheduledForDate(selectedDay) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{monthName}</h2>
            <p className="text-sm text-gray-400">{year}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {Array.from({ length: numDays }).map((_, i) => {
            const day = i + 1;
            const hasEvent = getScheduledForDate(day).length > 0;
            const isSelected = selectedDay === day;
            const today = isToday(day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all
                  ${isSelected ? 'bg-indigo-600 text-white shadow-lg scale-110 z-10' : 'hover:bg-indigo-50 text-gray-700'}
                  ${today && !isSelected ? 'border-2 border-indigo-100' : ''}
                `}
              >
                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>{day}</span>
                {hasEvent && (
                  <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></div>
                )}
                {today && !isSelected && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl shadow-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Planned Looks</h3>
              <p className="text-xs opacity-60">For {selectedDay} {monthName}</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar-light">
            {activeSchedules.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 opacity-30">
                  <CalendarIcon size={24} />
                </div>
                <p className="text-xs text-white/40 italic">Nothing planned for this day.</p>
                <p className="text-[10px] text-white/20 mt-1">Check chat for outfit ideas!</p>
              </div>
            ) : (
              activeSchedules.map(item => {
                const pieces = item.outfit.itemIds.map(id => closet.find(c => c.id === id)).filter(Boolean);
                return (
                  <div key={item.id} className="bg-white/10 rounded-2xl p-4 border border-white/5 group hover:bg-white/15 transition relative">
                    <button 
                      onClick={() => onDeleteSchedule(item.id)}
                      className="absolute top-3 right-3 text-white/30 hover:text-red-400 p-1 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <h4 className="text-sm font-bold pr-6">{item.outfit.name}</h4>
                    <p className="text-[10px] text-white/50 mt-1 mb-4 leading-relaxed line-clamp-2">{item.outfit.description}</p>
                    
                    <div className="flex -space-x-2">
                      {pieces.slice(0, 4).map((p, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full border-2 border-gray-900 overflow-hidden bg-gray-800">
                          <img src={p!.photo} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {pieces.length > 4 && (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
                          +{pieces.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend/Summary */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Planned</h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-indigo-600">{scheduled.length}</span>
            <span className="text-xs text-gray-500 mb-1 font-medium">Outfits scheduled in total</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
