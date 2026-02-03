
import React, { useState, useEffect } from 'react';
import { FastingState, SocialNotification, AppState, Accessory } from '../types';
import { Zap, Utensils, Edit3, Star, Heart, Moon, Sparkles, ShoppingBag, Plane, IceCream, Camera, Check, X } from 'lucide-react';
import { MOCHI_QUOTES, BINNIE_ACCESSORIES, TRANSLATIONS } from '../constants';

interface Props {
  state: FastingState;
  startTime: number | null;
  goalHours: number;
  isDarkMode: boolean;
  appState: AppState;
  onToggle: () => void;
  onUpdateGoal: (hours: number) => void;
  onCollectReward: () => void;
  onPurchase: (acc: Accessory) => void;
  onToggleMode: (mode: 'cheat' | 'travel') => void;
  onEquip: (acc: Accessory) => void;
}

export const FastingTimer: React.FC<Props> = ({ 
  state, startTime, goalHours, isDarkMode, appState, 
  onToggle, onUpdateGoal, onCollectReward, onPurchase, onToggleMode, onEquip 
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalInput, setGoalInput] = useState(goalHours.toString());
  const [expression, setExpression] = useState<'normal' | 'happy' | 'surprise' | 'tired' | 'celebrate'>('normal');
  const [quote, setQuote] = useState('');
  const [moons, setMoons] = useState<{ id: number; x: number; y: number }[]>([]);

  const t = (key: string) => TRANSLATIONS[appState.userProfile.language]?.[key] || key;

  // Keep internal state in sync with external goalHours
  useEffect(() => {
    setGoalInput(goalHours.toString());
  }, [goalHours]);

  useEffect(() => {
    if (!startTime || state === FastingState.EATING) {
      setElapsed(0);
      setQuote(MOCHI_QUOTES.NAPPING[Math.floor(Math.random() * MOCHI_QUOTES.NAPPING.length)]);
      setExpression('normal');
      return;
    }
    const interval = setInterval(() => {
      const e = Date.now() - startTime;
      setElapsed(e);
      const prog = (e / (goalHours * 3600 * 1000)) * 100;
      if (prog > 100) setExpression('celebrate');
      else if (prog > 85) setExpression('tired');
      else if (prog > 50) setExpression('happy');
    }, 1000);
    setQuote(MOCHI_QUOTES.FASTING[Math.floor(Math.random() * MOCHI_QUOTES.FASTING.length)]);
    return () => clearInterval(interval);
  }, [startTime, state, goalHours]);

  const progress = Math.min((elapsed / (goalHours * 3600 * 1000)) * 100, 100);

  const handleMochiTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setExpression('happy');
    const newMoon = { id: Date.now(), x, y };
    setMoons(prev => [...prev, newMoon]);
    if (state === FastingState.FASTING) onCollectReward();
    setQuote(MOCHI_QUOTES.TAPPED[Math.floor(Math.random() * MOCHI_QUOTES.TAPPED.length)]);
    setTimeout(() => { 
      setExpression('normal'); 
      setMoons(prev => prev.filter(m => m.id !== newMoon.id)); 
    }, 1000);
  };

  const getAccIcon = (type: 'head' | 'hand' | 'back') => {
    const id = appState.activeAccessories[type];
    return BINNIE_ACCESSORIES.find(a => a.id === id)?.icon;
  };

  const handleUpdateGoal = () => {
    const h = parseInt(goalInput);
    if (!isNaN(h) && h > 0) {
      onUpdateGoal(h);
      setShowGoalInput(false);
    }
  };

  return (
    <div className={`p-6 rounded-[3.5rem] shadow-sm border transition-all duration-500 flex flex-col items-center relative min-h-[820px] overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-b from-blue-50 to-white border-blue-50'}`}>
      
      {/* Flight Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 opacity-20 animate-pulse"><Moon size={60} fill="#60a5fa" className="text-blue-400"/></div>
        <div className="absolute top-40 left-10 opacity-10 animate-float-bg-1"><Sparkles size={40} className="text-blue-300"/></div>
        <div className="absolute bottom-60 right-20 opacity-10 animate-float-bg-2"><Star size={30} fill="#93c5fd" className="text-blue-200"/></div>
        <div className="absolute top-2/3 -left-10 w-40 h-10 bg-white/40 blur-xl rounded-full animate-cloud-move-1"></div>
        <div className="absolute top-1/4 -right-10 w-32 h-8 bg-blue-100/30 blur-xl rounded-full animate-cloud-move-2"></div>
      </div>

      {/* Header Info */}
      <div className="w-full flex justify-between items-center z-10 px-2 mb-4">
        <div className="flex gap-2">
          <button 
            onClick={() => onToggleMode('cheat')} 
            className={`p-2 rounded-xl border flex items-center gap-1 transition-all ${appState.isCheatDay ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white/50 border-slate-100 text-slate-400'}`}
          >
            <IceCream size={14} /> <span className="text-[9px] font-black uppercase">Cheat</span>
          </button>
          <button 
            onClick={() => onToggleMode('travel')} 
            className={`p-2 rounded-xl border flex items-center gap-1 transition-all ${appState.isTravelMode ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white/50 border-slate-100 text-slate-400'}`}
          >
            <Plane size={14} /> <span className="text-[9px] font-black uppercase">Travel</span>
          </button>
        </div>
        <div className="flex gap-2 relative">
          {showGoalInput ? (
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-xl border border-blue-100 animate-in zoom-in-95">
              <input 
                type="number" 
                value={goalInput} 
                onChange={e => setGoalInput(e.target.value)} 
                className="w-12 p-2 text-xs font-black text-center outline-none bg-transparent"
                autoFocus
              />
              <button onClick={handleUpdateGoal} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={14}/></button>
              <button onClick={() => setShowGoalInput(false)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><X size={14}/></button>
            </div>
          ) : (
            <button onClick={() => setShowGoalInput(true)} className="px-4 py-2 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-100 transition-all flex items-center gap-2 border border-blue-100 dark:bg-slate-700 dark:border-slate-600 dark:text-blue-300">
              <Edit3 size={14} />
              <span className="text-[10px] font-black uppercase">{goalHours}h Goal</span>
            </button>
          )}
        </div>
      </div>

      {/* Main UI */}
      <div className="relative flex flex-col items-center justify-center flex-1 w-full pt-16">
        <div className="absolute -top-6 bg-slate-800 text-white px-5 py-2.5 rounded-[1.8rem] text-[11px] font-black animate-bounce shadow-2xl z-20 border-2 border-blue-100/10 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-slate-800">
          {quote}
        </div>

        <div onClick={handleMochiTap} className="relative cursor-pointer active:scale-95 transition-all">
          {moons.map(moon => (
            <div key={moon.id} className="absolute pointer-events-none animate-float-up text-blue-400 z-30" style={{ left: moon.x, top: moon.y }}>
              <Moon fill="currentColor" size={32} />
            </div>
          ))}

          <div className={`relative w-64 h-64 flex items-center justify-center ${state === FastingState.FASTING ? 'animate-hop' : 'animate-breathing'}`}>
             {/* Accessory: Back */}
             <div className="absolute -top-10 text-5xl z-0 opacity-80">
              {appState.isTravelMode ? '🎒' : getAccIcon('back')}
             </div>

             {/* Giant Floppy Ears */}
             <div className={`absolute -left-16 top-12 w-36 h-20 bg-white border-4 border-slate-800 rounded-[3rem] origin-right transition-all duration-700 ${state === FastingState.FASTING ? 'animate-ear-float-1' : 'rotate-[15deg]'}`}></div>
             <div className={`absolute -right-16 top-12 w-36 h-20 bg-white border-4 border-slate-800 rounded-[3rem] origin-left transition-all duration-700 ${state === FastingState.FASTING ? 'animate-ear-float-2' : 'rotate-[-15deg]'}`}></div>
             
             {/* Plump Body */}
             <div className={`relative w-48 h-40 bg-white border-4 border-slate-800 rounded-[5rem] flex flex-col items-center justify-center overflow-hidden shadow-inner ${appState.isCheatDay ? 'ring-8 ring-amber-100/50' : ''}`}>
                {/* Accessory: Head */}
                <div className="absolute top-1 text-3xl z-30">{getAccIcon('head')}</div>

                {/* Blush - ALWAYS VISIBLE DURING FASTING AND CUTE */}
                {(state === FastingState.FASTING || expression === 'happy' || appState.isCheatDay) && (
                  <>
                    <div className="absolute top-[65px] left-8 w-10 h-5 bg-pink-100 rounded-[100%] blur-[3px] opacity-90 animate-pulse"></div>
                    <div className="absolute top-[65px] right-8 w-10 h-5 bg-pink-100 rounded-[100%] blur-[3px] opacity-90 animate-pulse"></div>
                  </>
                )}

                <div className="flex gap-14 mt-4 relative z-10">
                   {state === FastingState.EATING ? (
                      <><div className="w-8 h-1 bg-slate-800 rounded-full"></div><div className="w-8 h-1 bg-slate-800 rounded-full"></div></>
                   ) : expression === 'happy' || expression === 'celebrate' ? (
                      <><div className="text-blue-500 font-black text-4xl -mt-4">^</div><div className="text-blue-500 font-black text-4xl -mt-4">^</div></>
                   ) : (
                      <><div className="w-6 h-8 bg-blue-500 rounded-full border-2 border-slate-800"></div><div className="w-6 h-8 bg-blue-500 rounded-full border-2 border-slate-800"></div></>
                   )}
                </div>
                <div className={`mt-3 w-5 h-2.5 border-b-2 border-slate-800 rounded-full transition-all ${expression === 'celebrate' ? 'h-6 w-8 bg-rose-400 border-none' : ''}`}></div>
             </div>

             {/* Accessory: Hand */}
             <div className="absolute bottom-4 right-0 text-4xl z-40 transform rotate-[15deg]">
              {appState.isCheatDay ? '🍩' : appState.isTravelMode ? '📷' : getAccIcon('hand')}
             </div>

             {/* Swirl Tail */}
             <div className="absolute -bottom-2 right-12 w-10 h-10 bg-white border-4 border-slate-800 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-b-2 border-slate-800 rounded-full animate-spin-slow"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="w-full text-center mb-8 z-10">
        <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] mb-3">
            {state === FastingState.FASTING ? t('fasting_active') : t('resting')}
        </p>
        <p className={`text-6xl font-black font-mono tracking-tighter transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {state === FastingState.FASTING ? (() => {
               const h = Math.floor(elapsed / 3600000);
               const m = Math.floor((elapsed % 3600000) / 60000);
               const s = Math.floor((elapsed % 60000) / 1000);
               return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            })() : '00:00:00'}
        </p>
        
        <div className={`mt-8 mx-auto w-full max-w-[320px] h-5 rounded-full overflow-hidden border-2 p-1.5 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-100 shadow-inner'}`}>
            <div className={`h-full transition-all duration-1000 rounded-full ${appState.isCheatDay ? 'bg-amber-400' : appState.isTravelMode ? 'bg-indigo-400' : 'bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-500'}`} style={{ width: `${progress}%` }}></div>
        </div>

        <button onClick={onToggle} className={`w-full max-w-[320px] py-6 rounded-[2.5rem] font-black text-sm uppercase mt-6 text-white shadow-2xl transform active:scale-95 transition-all ${state === FastingState.FASTING ? 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-blue-200' : 'bg-gradient-to-r from-emerald-400 to-teal-600 shadow-emerald-200'}`}>
          {state === FastingState.FASTING ? <div className="flex items-center justify-center gap-2"><Utensils size={20}/> {t('end_quest')}</div> : <div className="flex items-center justify-center gap-2"><Zap size={20}/> {t('start_quest')}</div>}
        </button>
      </div>

      {/* Boutique Section */}
      <div className={`w-full p-6 rounded-[2.5rem] mt-auto ${isDarkMode ? 'bg-slate-700' : 'bg-white/80'} border-2 border-dashed border-blue-200 backdrop-blur-sm z-10`}>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag size={18} className="text-blue-500"/>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{t('shop_title')}</h3>
          <div className="ml-auto text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center gap-1 border border-blue-100">
            <Moon size={10} fill="currentColor"/> {appState.collectedItems} Shards
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
          {BINNIE_ACCESSORIES.map(acc => {
            const isOwned = appState.ownedAccessories.includes(acc.id);
            const isActive = Object.values(appState.activeAccessories).includes(acc.id);
            return (
              <div key={acc.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                <button 
                  onClick={() => isOwned ? onEquip(acc) : onPurchase(acc)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all border-4 relative ${isActive ? 'bg-blue-300 border-blue-500 shadow-lg' : isOwned ? 'bg-white border-blue-100' : 'bg-slate-100 border-transparent grayscale'}`}
                >
                  {acc.icon}
                  {isActive && <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-0.5 rounded-full"><Star size={12} fill="white"/></div>}
                </button>
                <div className="text-center">
                   <p className="text-[8px] font-black uppercase truncate w-14 text-slate-500">{acc.name}</p>
                   {!isOwned && <p className="text-[9px] font-black text-blue-500">{acc.cost}🌙</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes cloud-move-1 { 0% { transform: translateX(-100px); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateX(500px); opacity: 0; } }
        @keyframes cloud-move-2 { 0% { transform: translateX(100px); opacity: 0; } 50% { opacity: 0.3; } 100% { transform: translateX(-500px); opacity: 0; } }
        @keyframes float-bg-1 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(20px, 40px); } }
        @keyframes float-bg-2 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-30px, -20px); } }
        .animate-cloud-move-1 { animation: cloud-move-1 20s linear infinite; }
        .animate-cloud-move-2 { animation: cloud-move-2 25s linear infinite; }
        .animate-float-bg-1 { animation: float-bg-1 10s ease-in-out infinite; }
        .animate-float-bg-2 { animation: float-bg-2 12s ease-in-out infinite; }
        
        @keyframes hop { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes ear-float-1 { 0%, 100% { transform: rotate(-10deg) translateY(0); } 50% { transform: rotate(-30deg) translateY(-10px); } }
        @keyframes ear-float-2 { 0%, 100% { transform: rotate(10deg) translateY(0); } 50% { transform: rotate(30deg) translateY(-10px); } }
        @keyframes spin-slow { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        .animate-hop { animation: hop 1.5s ease-in-out infinite; }
        .animate-ear-float-1 { animation: ear-float-1 1.2s ease-in-out infinite; }
        .animate-ear-float-2 { animation: ear-float-2 1.2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
};
