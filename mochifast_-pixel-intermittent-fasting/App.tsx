
import React, { useState, useEffect, useMemo } from 'react';
import { FastingTimer } from './components/FastingTimer';
import { ZenBuddyChat } from './components/ZenBuddyChat';
import { MealLogger } from './components/MealLogger';
import { WeightTracker } from './components/WeightTracker';
import { DistractionGame } from './components/DistractionGame';
import { SettingsView } from './components/SettingsView';
import { SocialView } from './components/SocialView';
import { WaterTracker } from './components/WaterTracker';
import { SleepTracker } from './components/SleepTracker';
import { AppState, FastingState, WeightRecord, MealRecord, FastingHistoryRecord, Buddy, SleepRecord, SocialNotification, WeeklyReview, Accessory } from './types';
import { Home, MessageSquare, UtensilsCrossed, Settings, Trophy, Sparkles, Users, Heart, Moon, Sun, Bed, Star, Mail, CloudMoon } from 'lucide-react';
import { CALMING_MESSAGES, TRANSLATIONS, BINNIE_ACCESSORIES } from './constants';
import { getWeeklyReviewLetter } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'meals' | 'chat' | 'stats' | 'social' | 'settings'>('home');
  const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });
  const [showWeeklyLetter, setShowWeeklyLetter] = useState(false);
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('cinnamo_v11');
    const code = "MOCHI-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    return saved ? JSON.parse(saved) : {
      userProfile: { name: 'MochiUser', height: 175, initialWeight: 85.5, targetWeight: 75.0, age: 25, sex: 'female', language: 'en', themeColor: 'blue' },
      customGoals: { calories: 2000, protein: 150, fats: 60, carbs: 200, sleepHours: 8 },
      inviteCode: code,
      isDarkMode: false,
      isCheatDay: false,
      isTravelMode: false,
      currentFastingState: FastingState.EATING,
      fastStartTime: null,
      fastDurationGoal: 16,
      currentSleepStartTime: null,
      sleepLogs: [],
      weightLogs: [{ date: 'Oct 1', timestamp: Date.now() - 400000000, weight: 85.5, bmi: 27.9 }],
      mealLogs: [],
      fastingHistory: [],
      weeklyReviews: [],
      ownedAccessories: ['cookie'], // Start with a cinnamon roll!
      activeAccessories: { hand: 'cookie' },
      waterIntake: 0,
      waterGoal: 2000,
      streak: 5,
      collectedItems: 10, // Start with some shards
      starsReceived: 0,
      notifications: [],
      settings: { notifications: true, reminders: true },
      buddies: [
        { id: '1', name: 'Sora', isFasting: true, isOnline: true, streak: 12, weightLost: 3.2, isFavorite: true, order: 0 },
        { id: '2', name: 'Riku', isFasting: false, isOnline: false, streak: 8, weightLost: 1.5, isFavorite: false, order: 1 }
      ]
    };
  });

  const language = state.userProfile.language || 'en';
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;
  const themeActiveIcon = state.userProfile.themeColor === 'pink' ? 'text-pink-500' : 'text-blue-500';

  useEffect(() => {
    localStorage.setItem('cinnamo_v11', JSON.stringify(state));
    if (state.isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [state]);

  // Simulate Push Notifications for Friend interactions
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9 && state.buddies.length > 0) {
        const buddy = state.buddies[Math.floor(Math.random() * state.buddies.length)];
        const types: SocialNotification['type'][] = ['star', 'moon', 'message', 'fast_start'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const newNotif: SocialNotification = {
          id: Math.random().toString(),
          from: buddy.name,
          type: type,
          content: type === 'message' ? "You're doing great! ✨" : undefined,
          timestamp: Date.now(),
          read: false
        };

        setState(prev => ({
          ...prev,
          notifications: [newNotif, ...prev.notifications.slice(0, 19)],
          buddies: prev.buddies.map(b => b.id === buddy.id ? {...b, isOnline: type === 'fast_start' ? true : b.isOnline, isFasting: type === 'fast_start' ? true : b.isFasting} : b)
        }));

        let msg = "";
        if (type === 'star') msg = `${buddy.name} sent you a Star! ⭐`;
        else if (type === 'moon') msg = `${buddy.name} sent you a Moon Shard! 🌙`;
        else if (type === 'message') msg = `${buddy.name} messaged you: "You're doing great!" 💬`;
        else msg = `${buddy.name} just started a new Fasting Quest! 🚀`;

        showToast(msg);
      }
    }, 20000); // Check every 20s
    return () => clearInterval(interval);
  }, [state.buddies]);

  const showToast = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  const handleSendAction = (buddyId: string, type: 'star' | 'moon' | 'message', content?: string) => {
    const buddy = state.buddies.find(b => b.id === buddyId);
    if (!buddy) return;

    if (type === 'moon') {
      if (state.collectedItems <= 0) {
        showToast("No Shards left to gift! 🌙");
        return;
      }
      setState(prev => ({ ...prev, collectedItems: prev.collectedItems - 1 }));
    }

    showToast(`Successfully sent ${type} to ${buddy.name}! ✨`);

    // Simulate friend's reaction toast
    setTimeout(() => {
      showToast(`${buddy.name} reacted to your ${type}! 🐰💖`);
    }, 3000);
  };

  const handleToggleFast = () => {
    if (state.currentFastingState === FastingState.EATING) {
      setState(prev => ({
        ...prev,
        currentFastingState: FastingState.FASTING,
        fastStartTime: Date.now()
      }));
      showToast("Quest started! Flap those ears! 🐰☁️");
    } else {
      const elapsed = Date.now() - (state.fastStartTime || Date.now());
      const hours = elapsed / 3600000;
      const success = hours >= state.fastDurationGoal;
      
      const newRecord: FastingHistoryRecord = {
        id: Math.random().toString(36).substr(2, 9),
        startTime: state.fastStartTime || Date.now(),
        endTime: Date.now(),
        goalHours: state.fastDurationGoal,
        success,
        mode: state.isCheatDay ? 'cheat' : state.isTravelMode ? 'travel' : 'normal'
      };

      setState(prev => ({
        ...prev,
        currentFastingState: FastingState.EATING,
        fastStartTime: null,
        fastingHistory: [newRecord, ...prev.fastingHistory],
        streak: success ? prev.streak + 1 : prev.streak,
        collectedItems: prev.collectedItems + (success ? 5 : 0)
      }));
      showToast(success ? "Landed safely! You found 5 shards! 🌙" : "Flight ended early. Resting. 🐰");
    }
  };

  const handlePurchase = (acc: Accessory) => {
    if (state.collectedItems < acc.cost) {
      showToast("Not enough Moon Shards! Keep fasting! 🌙");
      return;
    }
    setState(prev => ({
      ...prev,
      collectedItems: prev.collectedItems - acc.cost,
      ownedAccessories: [...prev.ownedAccessories, acc.id],
      activeAccessories: { ...prev.activeAccessories, [acc.type]: acc.id }
    }));
    showToast(`Purchased ${acc.name}! Looking cute! ✨`);
  };

  const handleEquip = (acc: Accessory) => {
    setState(prev => ({
      ...prev,
      activeAccessories: {
        ...prev.activeAccessories,
        [acc.type]: prev.activeAccessories[acc.type as keyof typeof prev.activeAccessories] === acc.id ? undefined : acc.id
      }
    }));
  };

  const toggleSleep = () => {
    if (state.currentSleepStartTime) {
      const duration = (Date.now() - state.currentSleepStartTime) / 60000;
      const newLog: SleepRecord = {
          id: Math.random().toString(36).substr(2,9),
          startTime: state.currentSleepStartTime,
          endTime: Date.now(),
          durationMinutes: duration
      };
      setState(prev => ({ ...prev, currentSleepStartTime: null, sleepLogs: [newLog, ...prev.sleepLogs] }));
      showToast("Rise and shine! Rest quest logged. ☀️");
    } else {
      setState(prev => ({ ...prev, currentSleepStartTime: Date.now() }));
      showToast("Goodnight! Cloud dreams incoming... 🌙");
    }
  };

  const addManualSleep = (start: number, end: number) => {
      const duration = (end - start) / 60000;
      const newLog: SleepRecord = {
          id: Math.random().toString(36).substr(2,9),
          startTime: start,
          endTime: end,
          durationMinutes: duration
      };
      setState(prev => ({ ...prev, sleepLogs: [newLog, ...prev.sleepLogs] }));
      showToast("Sleep history updated! ✨");
  };

  return (
    <div className={`min-h-screen pb-24 max-w-md mx-auto relative font-sans transition-all duration-700 ${state.isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#F4FAFF] text-slate-900'}`}>
      <header className={`p-6 sticky top-0 z-40 flex justify-between items-center border-b transition-colors ${state.isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-blue-50'} backdrop-blur-md shadow-sm`}>
        <div className="flex gap-4 items-center">
          <div>
            <h1 className={`text-2xl font-black tracking-tighter ${state.userProfile.themeColor === 'pink' ? 'text-pink-500' : 'text-blue-500'}`}>CinnamoFast</h1>
            <div className="flex gap-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Star size={10} className="text-yellow-400" fill="currentColor" /> {state.streak}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Moon size={10} className="text-blue-400" fill="currentColor" /> {state.collectedItems}</p>
            </div>
          </div>
        </div>
        <button onClick={() => setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }))} className={`p-2.5 rounded-2xl transition-all shadow-sm ${state.isDarkMode ? 'bg-slate-800 text-yellow-300' : 'bg-blue-50 text-blue-500'}`}>
          {state.isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </header>

      {toast.visible && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] w-full px-4 animate-in slide-in-from-top-6 fade-in duration-500">
          <div className="bg-slate-900 text-white p-5 rounded-[2.2rem] shadow-2xl flex items-center gap-4 border border-slate-700">
            <div className={`p-2.5 rounded-2xl ${state.userProfile.themeColor === 'pink' ? 'text-pink-400' : 'text-blue-400'} bg-white/10`}><Heart fill="currentColor" size={20} /></div>
            <p className="text-[11px] font-black leading-tight tracking-wide uppercase">{toast.message}</p>
          </div>
        </div>
      )}

      <main className="p-4 space-y-8">
        {activeTab === 'home' && (
          <>
            <FastingTimer 
              state={state.currentFastingState} 
              startTime={state.fastStartTime} 
              goalHours={state.fastDurationGoal} 
              isDarkMode={state.isDarkMode} 
              appState={state}
              onToggle={handleToggleFast} 
              onUpdateGoal={(h) => setState(prev => ({ ...prev, fastDurationGoal: h }))} 
              onCollectReward={() => setState(prev => ({ ...prev, collectedItems: prev.collectedItems + 1 }))}
              onPurchase={handlePurchase}
              onEquip={handleEquip}
              onToggleMode={(mode) => setState(prev => mode === 'cheat' ? ({ ...prev, isCheatDay: !prev.isCheatDay, isTravelMode: false }) : ({ ...prev, isTravelMode: !prev.isTravelMode, isCheatDay: false }))}
            />
            <SleepTracker 
                currentStartTime={state.currentSleepStartTime} 
                logs={state.sleepLogs} 
                goalHours={state.customGoals.sleepHours} 
                onToggle={toggleSleep} 
                onManualAdd={addManualSleep} 
                isDarkMode={state.isDarkMode} 
            />
            <WaterTracker current={state.waterIntake} goal={state.waterGoal} onAdd={(amt) => setState(prev => ({ ...prev, waterIntake: prev.waterIntake + amt }))} />
            <DistractionGame />
          </>
        )}
        {activeTab === 'meals' && <MealLogger meals={state.mealLogs} goals={state.customGoals} onAddMeal={(m) => setState(prev => ({ ...prev, mealLogs: [{ ...m, id: Math.random().toString(), timestamp: Date.now() }, ...prev.mealLogs] }))} updateGoals={(g) => setState(prev => ({ ...prev, customGoals: { ...prev.customGoals, ...g } }))} isDarkMode={state.isDarkMode} />}
        {activeTab === 'chat' && <ZenBuddyChat language={language} />}
        {activeTab === 'stats' && <WeightTracker logs={state.weightLogs} fastingHistory={state.fastingHistory} profile={state.userProfile} onAddLog={(l) => setState(prev => ({ ...prev, weightLogs: [...prev.weightLogs, l].sort((a,b) => a.timestamp - b.timestamp) }))} />}
        {activeTab === 'social' && <SocialView buddies={state.buddies} collectedItems={state.collectedItems} notifications={state.notifications} inviteCode={state.inviteCode} onSendAction={handleSendAction} onAddBuddy={(n) => setState(prev => ({ ...prev, buddies: [...prev.buddies, { id: Math.random().toString(), name: n, isFasting: true, isOnline: true, streak: 1, weightLost: 0, isFavorite: false, order: prev.buddies.length }] }))} onClearNotification={(id) => setState(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? {...n, read: true} : n) }))} onUpdateBuddy={(id, upd) => setState(prev => ({ ...prev, buddies: prev.buddies.map(b => b.id === id ? {...b, ...upd} : b) }))} onReorderBuddies={(buds) => setState(prev => ({ ...prev, buddies: buds }))} isDarkMode={state.isDarkMode} language={language} />}
        {activeTab === 'settings' && <SettingsView state={state} updateProfile={(p) => setState(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...p } }))} updateSettings={(s) => {}} onEnterInviteCode={(code) => showToast("Invite Valid! ✨")} />}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 border-t p-5 flex justify-around items-center z-50 shadow-2xl transition-colors duration-500 ${state.isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-blue-50'} backdrop-blur-xl`}>
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? themeActiveIcon + ' scale-110' : 'text-slate-400'}`}><Home size={24} /><span className="text-[10px] font-black uppercase">{t('sky')}</span></button>
        <button onClick={() => setActiveTab('meals')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'meals' ? themeActiveIcon + ' scale-110' : 'text-slate-400'}`}><UtensilsCrossed size={24} /><span className="text-[10px] font-black uppercase">{t('diet')}</span></button>
        <button onClick={() => setActiveTab('chat')} className={`relative flex flex-col items-center gap-1.5 transition-all ${activeTab === 'chat' ? themeActiveIcon : 'text-slate-400'}`}>
          <div className={`absolute -top-14 p-4.5 rounded-[2.5rem] text-white shadow-2xl transition-all border-4 ${activeTab === 'chat' ? (state.userProfile.themeColor === 'pink' ? 'bg-pink-500 border-white' : 'bg-blue-500 border-white') : 'bg-slate-400 border-white dark:border-slate-900'}`}>
            <CloudMoon size={28} />
          </div>
          <span className="text-[10px] font-black uppercase mt-7">{t('talk')}</span>
        </button>
        <button onClick={() => setActiveTab('social')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'social' ? themeActiveIcon + ' scale-110' : 'text-slate-400'}`}><Users size={24} /><span className="text-[10px] font-black uppercase">{t('circle')}</span></button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'stats' ? themeActiveIcon + ' scale-110' : 'text-slate-400'}`}><Trophy size={24} /><span className="text-[10px] font-black uppercase">{t('goal')}</span></button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'settings' ? themeActiveIcon + ' scale-110' : 'text-slate-400'}`}><Settings size={24} /><span className="text-[10px] font-black uppercase">{t('prefs')}</span></button>
      </nav>
    </div>
  );
};

export default App;
