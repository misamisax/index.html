
import React, { useState, useEffect, useMemo } from 'react';
import { Bed, Moon, Sun, Plus, History, X, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { SleepRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';

interface Props {
  currentStartTime: number | null;
  logs: SleepRecord[];
  goalHours: number;
  onToggle: () => void;
  onManualAdd: (start: number, end: number) => void;
  isDarkMode: boolean;
}

export const SleepTracker: React.FC<Props> = ({ currentStartTime, logs, goalHours, onToggle, onManualAdd, isDarkMode }) => {
  const [elapsed, setElapsed] = useState(0);
  const [showManual, setShowManual] = useState(false);
  const [manualData, setManualData] = useState({ start: '', end: '' });
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    if (!currentStartTime) return;
    const interval = setInterval(() => setElapsed(Date.now() - currentStartTime), 1000);
    return () => clearInterval(interval);
  }, [currentStartTime]);

  const totalToday = useMemo(() => {
    const today = new Date().toDateString();
    return logs.filter(l => new Date(l.startTime).toDateString() === today)
               .reduce((acc, l) => acc + l.durationMinutes, 0) / 60;
  }, [logs]);

  const analyticsData = useMemo(() => {
    if (view === 'weekly') {
      const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      return days.map((day, idx) => {
        const now = new Date();
        const diff = idx - now.getDay();
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + diff);
        const dateStr = targetDate.toDateString();
        const hrs = logs.filter(l => new Date(l.startTime).toDateString() === dateStr)
                        .reduce((acc, l) => acc + l.durationMinutes, 0) / 60;
        return { name: day, hours: hrs };
      });
    } else if (view === 'monthly') {
      const weeks = ['W1', 'W2', 'W3', 'W4'];
      return weeks.map((w, idx) => {
        const hrs = logs.filter(l => {
          const d = new Date(l.startTime);
          return d.getMonth() === new Date().getMonth() && Math.floor(d.getDate()/7) === idx;
        }).reduce((acc, l) => acc + l.durationMinutes, 0) / 60 / 7;
        return { name: w, hours: hrs };
      });
    }
    return [];
  }, [logs, view]);

  const progress = Math.min(100, (totalToday / goalHours) * 100);
  const sleepDeficit = view === 'weekly' && analyticsData.filter(d => d.hours > 0 && d.hours < goalHours).length >= 4;

  const handleManualSave = () => {
    if (!manualData.start || !manualData.end) return;
    onManualAdd(new Date(manualData.start).getTime(), new Date(manualData.end).getTime());
    setShowManual(false);
    setManualData({ start: '', end: '' });
  };

  return (
    <div className={`p-8 rounded-[3.5rem] shadow-sm border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-50'}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl dark:bg-slate-700 dark:text-indigo-400"><Bed size={24} /></div>
          <h3 className={`font-black text-2xl ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Rest Lab</h3>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setView(v => v === 'daily' ? 'weekly' : v === 'weekly' ? 'monthly' : 'daily')} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors dark:bg-slate-700">
             {view === 'monthly' ? <Calendar size={20}/> : <History size={20}/>}
           </button>
           <button onClick={() => setShowManual(true)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-500 dark:bg-slate-700 transition-all active:scale-95"><Plus size={22} /></button>
        </div>
      </div>

      {view === 'daily' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Today's Flight</p>
              <p className="text-5xl font-black">{totalToday.toFixed(1)}<span className="text-xl text-slate-300 ml-2">hrs</span></p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-1">Goal: {goalHours}h</p>
              <p className={`text-[10px] font-bold ${progress >= 100 ? 'text-emerald-500' : 'text-slate-300'}`}>{progress >= 100 ? 'STREAK UP' : 'RESTING...'}</p>
            </div>
          </div>

          <div className={`w-full h-5 rounded-full overflow-hidden border-2 p-1.5 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-indigo-50 shadow-inner'}`}>
            <div className="h-full bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-600 transition-all duration-1000 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>

          {currentStartTime ? (
            <div className="bg-indigo-600 p-6 rounded-[2.5rem] flex items-center justify-between animate-pulse shadow-xl shadow-indigo-100 dark:shadow-none border-b-4 border-indigo-800">
               <div>
                 <p className="text-[11px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-1">Deep Sleep...</p>
                 <p className="text-2xl font-black text-white">
                   {(() => {
                      const h = Math.floor(elapsed / 3600000);
                      const m = Math.floor((elapsed % 3600000) / 60000);
                      return `${h}h ${m}m`;
                   })()}
                 </p>
               </div>
               <button onClick={onToggle} className="px-10 py-4 bg-white text-indigo-600 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Rise & Shine</button>
            </div>
          ) : (
            <button onClick={onToggle} className="w-full py-6 bg-indigo-50 text-indigo-600 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest border-2 border-dashed border-indigo-200 hover:bg-indigo-100 transition-all active:scale-95 dark:bg-slate-700/50 dark:border-slate-600 dark:text-indigo-400 flex items-center justify-center gap-3">
              <Moon size={18}/> Board Sleep Flight
            </button>
          )}
        </div>
      ) : (
        <div className="h-64 w-full animate-in fade-in duration-700">
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">{view === 'weekly' ? 'Weekly Rhythm' : 'Monthly Quality'}</p>
           <ResponsiveContainer width="100%" height="100%">
              {view === 'weekly' ? (
                <BarChart data={analyticsData}>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '900', fill: '#94a3b8' }} />
                   <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                   <Bar dataKey="hours" radius={[10, 10, 10, 10]}>
                      {analyticsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.hours >= goalHours ? '#6366f1' : '#cbd5e1'} />
                      ))}
                   </Bar>
                </BarChart>
              ) : (
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="colorHrs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '900', fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="hours" stroke="#6366f1" fillOpacity={1} fill="url(#colorHrs)" strokeWidth={4} />
                </AreaChart>
              )}
           </ResponsiveContainer>
        </div>
      )}

      {showManual && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className={`w-full max-w-sm p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden transition-all ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <button onClick={() => setShowManual(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={24}/></button>
              <div className="text-4xl mb-6">🛌</div>
              <h4 className="text-2xl font-black mb-8">Manual Entry</h4>
              <div className="space-y-6 mb-10">
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lights Out</p><input type="datetime-local" className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-indigo-400 transition-all dark:bg-slate-700" value={manualData.start} onChange={e => setManualData({...manualData, start: e.target.value})}/></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Wake Up</p><input type="datetime-local" className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-indigo-400 transition-all dark:bg-slate-700" value={manualData.end} onChange={e => setManualData({...manualData, end: e.target.value})}/></div>
              </div>
              <button 
                onClick={handleManualSave}
                disabled={!manualData.start || !manualData.end}
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all active:scale-95"
              >
                Save Voyage
              </button>
           </div>
        </div>
      )}

      {sleepDeficit && (
        <div className="mt-8 p-5 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex gap-4 animate-in slide-in-from-bottom-4 dark:bg-indigo-900/10 dark:border-indigo-900/20">
           <AlertCircle className="text-indigo-500 shrink-0" size={24}/>
           <div>
             <p className="text-[11px] font-black text-indigo-700 dark:text-indigo-300 uppercase mb-1">Schedule Alert</p>
             <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
               CinnamoCoach noticed you're missing rest! Your body needs recovery. Try shortening your next fast by 2 hours. 🐰🌙
             </p>
           </div>
        </div>
      )}
    </div>
  );
};
