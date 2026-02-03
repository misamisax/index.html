
import React from 'react';
import { Droplets, Plus } from 'lucide-react';

interface Props {
  current: number;
  goal: number;
  onAdd: (amount: number) => void;
}

export const WaterTracker: React.FC<Props> = ({ current, goal, onAdd }) => {
  const percent = Math.min(100, (current / goal) * 100);

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-blue-50 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Droplets size={20} /></div>
          <h3 className="font-black text-lg text-slate-800">Hydration</h3>
        </div>
        <span className="text-xs font-black text-blue-400 uppercase">{current} / {goal}ml</span>
      </div>

      <div className="relative w-full h-40 bg-blue-50 rounded-3xl overflow-hidden border-4 border-white shadow-inner mb-6">
        <div 
          className="absolute bottom-0 left-0 w-full bg-blue-400 transition-all duration-1000 ease-in-out"
          style={{ height: `${percent}%` }}
        >
          {/* Simple CSS Wave Simulation */}
          <div className="absolute -top-4 left-0 w-[200%] h-8 bg-blue-400 rounded-[40%] animate-wave opacity-50"></div>
          <div className="absolute -top-6 left-0 w-[200%] h-12 bg-blue-400 rounded-[35%] animate-wave-slow"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black text-white drop-shadow-md">{Math.round(percent)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onAdd(250)} className="py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 active:scale-95 transition-all">
          + 250ml
        </button>
        <button onClick={() => onAdd(500)} className="py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 active:scale-95 transition-all">
          + 500ml
        </button>
      </div>

      <style>{`
        @keyframes wave {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-wave {
          animation: wave 4s linear infinite;
        }
        .animate-wave-slow {
          animation: wave 7s linear infinite reverse;
        }
      `}</style>
    </div>
  );
};
