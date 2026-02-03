
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeightRecord, FastingHistoryRecord, AppState } from '../types';
import { TrendingDown, Scale, Target, Plus, X, Sparkles, Calendar, CheckCircle, Clock, Zap, Star, CloudMoon, ChevronLeft, ChevronRight } from 'lucide-react';
import { predictWeightGoalDate } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface Props {
  logs: WeightRecord[];
  fastingHistory: FastingHistoryRecord[];
  profile: AppState['userProfile'];
  onAddLog: (log: WeightRecord) => void;
}

export const WeightTracker: React.FC<Props> = ({ logs, fastingHistory, profile, onAddLog }) => {
  const [showDetailed, setShowDetailed] = useState(false);
  const [prediction, setPrediction] = useState<string>('Analyzing...');
  const t = (key: string) => TRANSLATIONS[profile.language]?.[key] || key;

  // Calendar View State for multi-month/year navigation
  const [viewDate, setViewDate] = useState(new Date());

  const [formData, setFormData] = useState({
    weight: '',
    bmr: '',
    muscleMass: '',
    bodyFatKg: '',
    bodyFatPercent: '',
    visceralFat: '',
  });

  const currentWeight = logs[logs.length - 1]?.weight || profile.initialWeight;
  const bmi = profile.height ? (currentWeight / ((profile.height/100)**2)).toFixed(1) : '0';
  const bmiValue = parseFloat(bmi);

  useEffect(() => {
    const getPred = async () => {
      const res = await predictWeightGoalDate(currentWeight, profile.targetWeight, profile.age, profile.sex, profile.height);
      setPrediction(res);
    };
    getPred();
  }, [currentWeight, profile.targetWeight]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weight) return;
    const w = parseFloat(formData.weight);
    const calculatedBmi = profile.height ? parseFloat((w / ((profile.height/100)**2)).toFixed(1)) : undefined;

    onAddLog({
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      timestamp: Date.now(),
      weight: w,
      bmi: calculatedBmi,
      bmr: formData.bmr ? parseFloat(formData.bmr) : undefined,
      muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : undefined,
      bodyFatKg: formData.bodyFatKg ? parseFloat(formData.bodyFatKg) : undefined,
      bodyFatPercent: formData.bodyFatPercent ? parseFloat(formData.bodyFatPercent) : undefined,
      visceralFat: formData.visceralFat ? parseFloat(formData.visceralFat) : undefined,
    });
    setFormData({ weight: '', bmr: '', muscleMass: '', bodyFatKg: '', bodyFatPercent: '', visceralFat: '' });
    setShowDetailed(false);
  };

  const calendarDays = useMemo(() => {
    const days = [];
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    
    for(let i=0; i<start.getDay(); i++) days.push(null);

    for(let d=1; d<=end.getDate(); d++) {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
        const fast = fastingHistory.find(h => new Date(h.startTime).toDateString() === date.toDateString());
        days.push({ day: d, fast });
    }
    return days;
  }, [fastingHistory, viewDate]);

  const changeMonth = (offset: number) => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const status = bmiValue < 18.5 ? { label: 'Underweight', color: 'text-blue-400' } :
                 bmiValue < 25 ? { label: 'Healthy', color: 'text-emerald-500' } :
                 bmiValue < 30 ? { label: 'Overweight', color: 'text-orange-400' } :
                 { label: 'Obese', color: 'text-rose-500' };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Current BMI Section */}
      <div className="bg-white p-6 rounded-[3rem] shadow-sm border border-emerald-50 flex items-center justify-between">
        <div><h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Current BMI</h3><p className="text-4xl font-black text-slate-800">{bmi}</p></div>
        <div className="text-right"><p className={`text-sm font-black uppercase ${status.color}`}>{status.label}</p><p className="text-[8px] font-bold text-slate-300 uppercase">Height: {profile.height}cm</p></div>
      </div>

      {/* 2. InBody Update Section */}
      <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-blue-50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3"><div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl shadow-sm"><Target size={22} /></div><h3 className="font-black text-xl text-slate-800">InBody Update</h3></div>
          <button onClick={() => setShowDetailed(true)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95"><Plus size={20} /></button>
        </div>

        {showDetailed ? (
          <form onSubmit={handleAdd} className="space-y-4 animate-in zoom-in-95">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-2">Weight (kg)</p>
                  <input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-4 bg-slate-50 rounded-[1.5rem] text-sm font-black outline-none border-2 border-transparent focus:border-blue-300" required />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-2">BMR</p>
                  <input type="number" step="1" value={formData.bmr} onChange={e => setFormData({...formData, bmr: e.target.value})} className="w-full p-4 bg-slate-50 rounded-[1.5rem] text-sm font-black outline-none border-2 border-transparent focus:border-blue-300" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-2">Muscle (kg)</p>
                  <input type="number" step="0.1" value={formData.muscleMass} onChange={e => setFormData({...formData, muscleMass: e.target.value})} className="w-full p-4 bg-slate-50 rounded-[1.5rem] text-sm font-black outline-none border-2 border-transparent focus:border-blue-300" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-2">Body Fat (kg)</p>
                  <input type="number" step="0.1" value={formData.bodyFatKg} onChange={e => setFormData({...formData, bodyFatKg: e.target.value})} className="w-full p-4 bg-slate-50 rounded-[1.5rem] text-sm font-black outline-none border-2 border-transparent focus:border-blue-300" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-2">Body Fat (%)</p>
                  <input type="number" step="0.1" value={formData.bodyFatPercent} onChange={e => setFormData({...formData, bodyFatPercent: e.target.value})} className="w-full p-4 bg-slate-50 rounded-[1.5rem] text-sm font-black outline-none border-2 border-transparent focus:border-blue-300" />
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-2">Visceral Fat</p>
                  <input type="number" step="1" value={formData.visceralFat} onChange={e => setFormData({...formData, visceralFat: e.target.value})} className="w-full p-4 bg-slate-50 rounded-[1.5rem] text-sm font-black outline-none border-2 border-transparent focus:border-blue-300" />
                </div>
            </div>
            <button type="submit" className="w-full py-5 bg-blue-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-600 transition-all">Update Stats</button>
            <button type="button" onClick={() => setShowDetailed(false)} className="w-full py-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancel</button>
          </form>
        ) : (
          <div className="flex justify-between items-center bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
             <div className="text-center">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Weight</p>
               <p className="text-2xl font-black text-slate-800">{currentWeight.toFixed(1)}kg</p>
             </div>
             <div className="h-12 w-px bg-slate-200"></div>
             <div className="text-center">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Body Fat</p>
               <p className="text-2xl font-black text-slate-800">{logs[logs.length-1]?.bodyFatKg?.toFixed(1) || '--'}kg</p>
             </div>
          </div>
        )}
      </div>

      {/* 3. Sky Projection Section */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none scale-150"><CloudMoon size={100} /></div>
        <div className="relative z-10"><div className="flex items-center gap-3 mb-6"><div className="bg-white/10 p-2.5 rounded-2xl"><Sparkles size={24} /></div><h3 className="font-black text-xl tracking-tight">Sky Projection</h3></div><p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Target: {profile.targetWeight}kg</p><div className="text-4xl font-black mb-2 tracking-tighter">{prediction}</div><p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Estimated by Cloud AI</p></div>
      </div>

      {/* 4. Sky Voyage Section (Graph) */}
      <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-purple-50">
        <div className="flex items-center gap-3 mb-8"><div className="p-3 bg-purple-50 text-purple-500 rounded-2xl shadow-sm"><TrendingDown size={22} /></div><h3 className="font-black text-xl text-slate-800">Sky Voyage</h3></div>
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={logs}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip contentStyle={{ borderRadius: '25px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={5} dot={{ r: 6, fill: '#6366f1', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 9 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Quest Calendar Section (Bottom) */}
      <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-blue-50 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 text-blue-500 rounded-2xl shadow-sm"><Calendar size={22} /></div><h3 className="font-black text-xl text-slate-800">{t('fast_history')}</h3></div>
            <div className="flex items-center gap-4">
               <button onClick={() => changeMonth(-1)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors"><ChevronLeft size={20}/></button>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[120px] text-center">
                 {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
               </p>
               <button onClick={() => changeMonth(1)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors"><ChevronRight size={20}/></button>
            </div>
        </div>
        
        <div className="grid grid-cols-7 gap-3 text-center mb-4">
            {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[9px] font-black text-slate-300 uppercase">{d}</span>)}
            {calendarDays.map((d, i) => (
                <div key={i} className={`aspect-square relative flex items-center justify-center rounded-2xl transition-all ${!d ? '' : d.fast ? (d.fast.mode === 'cheat' ? 'bg-amber-50 border-amber-100' : d.fast.mode === 'travel' ? 'bg-indigo-50 border-indigo-100' : 'bg-blue-50 border-blue-100') : 'hover:bg-slate-50 border border-transparent'}`}>
                    {d && (
                        <>
                            <span className={`text-[11px] font-black ${d.fast ? (d.fast.mode === 'cheat' ? 'text-amber-600' : d.fast.mode === 'travel' ? 'text-indigo-600' : 'text-blue-600') : 'text-slate-400'}`}>{d.day}</span>
                            {d.fast && (
                                <div className={`absolute -top-1.5 -right-1.5 rounded-full p-1 shadow-md animate-in zoom-in-75 ${d.fast.mode === 'cheat' ? 'bg-amber-500 text-white' : d.fast.mode === 'travel' ? 'bg-indigo-500 text-white' : 'bg-blue-500 text-white'}`}>
                                    <Star size={10} fill="white"/>
                                </div>
                            )}
                            {d.fast && <span className={`absolute -bottom-1.5 text-[8px] font-black scale-90 ${d.fast.mode === 'cheat' ? 'text-amber-400' : d.fast.mode === 'travel' ? 'text-indigo-400' : 'text-blue-400'}`}>{Math.floor((d.fast.endTime - d.fast.startTime)/3600000)}h</span>}
                        </>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
