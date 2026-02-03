
import React, { useState, useMemo, useEffect } from 'react';
import { analyzeMeal, getDailyMealComment, getGoalRecommendation } from '../services/geminiService';
import { MealRecord, PFC, AppState } from '../types';
import { Plus, Search, Loader2, Salad, Sparkles, History, Settings2, Check, ArrowLeft, MessageCircle } from 'lucide-react';

interface Props {
  meals: MealRecord[];
  onAddMeal: (meal: Omit<MealRecord, 'id' | 'timestamp'>) => void;
  goals: AppState['customGoals'];
  updateGoals: (g: AppState['customGoals']) => void;
  isDarkMode: boolean;
}

export const MealLogger: React.FC<Props> = ({ meals, onAddMeal, goals, updateGoals, isDarkMode }) => {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [dailyComment, setDailyComment] = useState('');
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const todayStr = new Date().toDateString();
  const todayMeals = useMemo(() => meals.filter(m => new Date(m.timestamp).toDateString() === todayStr), [meals, todayStr]);

  const totals = todayMeals.reduce((acc, m) => ({
    p: acc.p + m.pfc.protein,
    f: acc.f + m.pfc.fats,
    c: acc.c + m.pfc.carbs,
    kcal: acc.kcal + m.pfc.calories
  }), { p: 0, f: 0, c: 0, kcal: 0 });

  const fetchDailyComment = async () => {
    if (todayMeals.length === 0) return;
    setIsLoadingComment(true);
    try {
      const comment = await getDailyMealComment(todayMeals, goals);
      setDailyComment(comment);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingComment(false);
    }
  };

  useEffect(() => {
    if (todayMeals.length > 0) fetchDailyComment();
  }, [todayMeals.length]);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeMeal(description);
      setPreview(data);
    } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
  };

  const handleConfirm = (food?: any) => {
    const target = food || preview;
    if (!target) return;
    onAddMeal({
      name: target.name || target[0],
      pfc: target.pfc || { protein: target.protein, fats: target.fats, carbs: target.carbs, calories: target.calories }
    });
    setPreview(null);
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className={`p-6 rounded-[3rem] shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-orange-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`font-black text-xl ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Nutrition Core</h3>
          <div className="flex gap-2">
            <button onClick={() => setShowGoalSettings(!showGoalSettings)} className="text-slate-300 p-2.5 bg-slate-50 rounded-2xl hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-400">
              <Settings2 size={20} />
            </button>
            <button onClick={fetchDailyComment} className="text-pink-400 p-2.5 bg-pink-50 rounded-2xl hover:bg-pink-100 dark:bg-slate-700 dark:text-pink-300">
              <Sparkles size={20} />
            </button>
          </div>
        </div>

        {dailyComment && (
          <div className="mb-6 p-5 bg-pink-50 rounded-[2rem] border border-pink-100 flex gap-4 dark:bg-pink-900/10 dark:border-pink-900/20">
             <div className="text-2xl shrink-0">🐰</div>
             <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300 leading-relaxed italic">
               {isLoadingComment ? 'Mochi is thinking...' : dailyComment}
             </p>
          </div>
        )}

        {showGoalSettings && (
          <div className="mb-6 p-6 bg-slate-50 rounded-[2rem] animate-in zoom-in-95 dark:bg-slate-900/50">
             <div className="grid grid-cols-2 gap-4 mb-4">
               {['calories', 'protein', 'fats', 'carbs'].map(field => (
                 <div key={field}>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{field}</p>
                   <input type="number" value={(goals as any)[field]} onChange={e => updateGoals({...goals, [field]: Number(e.target.value)})} className="w-full p-3 rounded-xl text-xs font-black border-2 border-transparent focus:border-indigo-400 bg-white dark:bg-slate-800 dark:text-white"/>
                 </div>
               ))}
             </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { l: 'Kcal', v: Math.max(0, goals.calories - totals.kcal), c: 'bg-orange-400', p: (totals.kcal / goals.calories) * 100 },
            { l: 'Prot', v: Math.max(0, goals.protein - totals.p), c: 'bg-blue-400', p: (totals.p / goals.protein) * 100 },
            { l: 'Fat', v: Math.max(0, goals.fats - totals.f), c: 'bg-yellow-400', p: (totals.f / goals.fats) * 100 },
            { l: 'Carb', v: Math.max(0, goals.carbs - totals.c), c: 'bg-emerald-400', p: (totals.c / goals.carbs) * 100 },
          ].map(item => (
            <div key={item.l} className="text-center">
              <div className="h-1.5 w-full rounded-full bg-slate-100 mb-2 overflow-hidden dark:bg-slate-700"><div className={`h-full ${item.c}`} style={{ width: `${Math.min(100, item.p)}%` }}></div></div>
              <p className="text-sm font-black">{item.v}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.l} Left</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-6 rounded-[3rem] shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-100 text-emerald-500 rounded-2xl dark:bg-slate-700"><Salad size={22} /></div>
          <h3 className={`font-black text-xl ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Kitchen Log</h3>
        </div>
        <div className="relative mb-4">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you munch on?..." className={`w-full px-5 py-4 rounded-[2rem] text-sm border-2 border-transparent focus:border-emerald-400 min-h-[120px] transition-all outline-none ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-50'}`} />
          <button onClick={handleAnalyze} disabled={isAnalyzing || !description.trim()} className="absolute bottom-4 right-4 p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 dark:shadow-none">
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Analyze
          </button>
        </div>

        {preview && (
          <div className="mt-4 p-6 bg-slate-50 rounded-[2.5rem] border-2 border-emerald-100 animate-in zoom-in-95 dark:bg-slate-900/30">
            <h4 className="font-black text-slate-800 mb-4 text-base dark:text-white">{preview.name}</h4>
            <div className="grid grid-cols-4 gap-3 mb-6 text-center">
              {[['P', preview.protein+'g'], ['F', preview.fats+'g'], ['C', preview.carbs+'g'], ['K', preview.calories]].map(([label, val]) => (
                <div key={label}><p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p><p className="font-black text-sm">{val}</p></div>
              ))}
            </div>
            <button onClick={() => handleConfirm()} className="w-full py-4 bg-emerald-500 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl">Commit to Log</button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-8">
          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Today's Kitchen</h4>
          <button onClick={() => setShowFullHistory(true)} className="flex items-center gap-2 text-[10px] font-black text-pink-400 uppercase tracking-widest hover:text-pink-500"><History size={14} /> View All</button>
        </div>
        {todayMeals.map(meal => (
          <div key={meal.id} className={`p-5 rounded-[2rem] shadow-sm border flex justify-between items-center mx-4 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}>
            <div className="flex items-center gap-4">
               <div className="p-3 bg-slate-50 rounded-2xl dark:bg-slate-700"><Salad size={18} className="text-emerald-500"/></div>
               <div><p className="font-black text-sm">{meal.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase">P:{meal.pfc.protein} F:{meal.pfc.fats} C:{meal.pfc.carbs}</p></div>
            </div>
            <div className="text-right"><p className="font-black text-emerald-500 text-lg">{meal.pfc.calories}</p><p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">KCAL</p></div>
          </div>
        ))}
      </div>
    </div>
  );
};
