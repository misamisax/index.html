
import React, { useState } from 'react';
import { User, Target, LogOut, Ruler, Scale, Heart, ShieldAlert, Key, Check, Globe, Calendar, Palette, Share2 } from 'lucide-react';
import { AppState, AppLanguage, ThemeColor } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../constants';

interface Props {
  state: AppState;
  updateProfile: (profile: Partial<AppState['userProfile']>) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  onEnterInviteCode: (code: string) => void;
}

export const SettingsView: React.FC<Props> = ({ state, updateProfile, updateSettings, onEnterInviteCode }) => {
  const isDarkMode = state.isDarkMode;
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const lang = state.userProfile.language || 'en';
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || key;

  const themePrimary = state.userProfile.themeColor === 'pink' ? 'text-pink-500' : 'text-blue-500';
  const themeBg = state.userProfile.themeColor === 'pink' ? 'bg-pink-500' : 'bg-blue-500';

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className={`p-10 rounded-[3.5rem] shadow-sm border text-center relative overflow-hidden transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-50'}`}>
        <div className={`absolute -top-12 -left-12 w-44 h-44 rounded-full blur-3xl ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-50'}`}></div>
        
        <div className="flex flex-col items-center gap-4">
           <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl font-black border-4 shadow-2xl ${isDarkMode ? 'bg-slate-700 border-slate-600 text-blue-300' : 'bg-white border-white ' + themePrimary}`}>
            {state.userProfile.name.charAt(0)}
          </div>
          <div className="w-full">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('id_name')}</p>
            <input 
              value={state.userProfile.name} 
              onChange={(e) => updateProfile({ name: e.target.value })}
              className={`text-2xl font-black text-center bg-transparent border-b-2 border-transparent focus:border-blue-400 outline-none w-full max-w-[240px] ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
              placeholder={t('id_name')}
            />
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className={`p-8 rounded-[3rem] shadow-sm border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-50'}`}>
        <div className="flex items-center gap-3 mb-6">
          <Share2 size={20} className="text-blue-400"/>
          <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Invitations</h4>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl mb-6 text-center border-2 border-dashed border-blue-200">
           <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Your Code</p>
           <p className={`text-xl font-black tracking-widest ${themePrimary}`}>{state.inviteCode}</p>
        </div>

        <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-tighter">Redeem Friend Code:</p>
        <div className="flex gap-3">
          <input 
            value={inviteCodeInput}
            onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
            placeholder="MOCHI-XXXXXX" 
            className={`flex-1 p-5 rounded-[1.8rem] text-xs font-black outline-none border-2 border-transparent focus:border-blue-400 dark:bg-slate-700 transition-all ${isDarkMode ? 'text-white' : 'bg-slate-50'}`} 
          />
          <button 
            onClick={() => { onEnterInviteCode(inviteCodeInput); setInviteCodeInput(''); }}
            className={`p-5 text-white rounded-[1.8rem] shadow-xl hover:opacity-90 active:scale-95 transition-all ${themeBg}`}
          >
            <Check size={24}/>
          </button>
        </div>
      </div>

      {/* REORDERED Biometrics Section */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest px-8">{t('biometrics')}</h4>
        <div className={`rounded-[3rem] overflow-hidden shadow-sm border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-50'}`}>
          {/* Height */}
          <div className={`p-6 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-700' : 'border-blue-50'}`}>
            <div className="flex items-center gap-4"><div className="p-3 bg-pink-50 text-pink-400 rounded-2xl dark:bg-slate-700"><Ruler size={20} /></div><span className="text-sm font-black">{t('height')}</span></div>
            <input type="number" value={state.userProfile.height} onChange={(e) => updateProfile({ height: parseInt(e.target.value) })} className={`w-16 text-right bg-transparent font-black outline-none ${themePrimary}`} />
          </div>
          
          {/* Age */}
          <div className={`p-6 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-700' : 'border-blue-50'}`}>
            <div className="flex items-center gap-4"><div className="p-3 bg-blue-50 text-blue-400 rounded-2xl dark:bg-slate-700"><Calendar size={20} /></div><span className="text-sm font-black">{t('age')}</span></div>
            <input type="number" value={state.userProfile.age} onChange={(e) => updateProfile({ age: parseInt(e.target.value) })} className={`w-16 text-right bg-transparent font-black outline-none ${themePrimary}`} />
          </div>

          {/* Identity */}
          <div className={`p-6 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-700' : 'border-blue-50'}`}>
            <div className="flex items-center gap-4"><div className="p-3 bg-amber-50 text-amber-500 rounded-2xl dark:bg-slate-700"><Heart size={20} /></div><span className="text-sm font-black">Identity</span></div>
            <select value={state.userProfile.sex} onChange={(e) => updateProfile({ sex: e.target.value as any })} className="bg-transparent font-black text-amber-500 outline-none text-sm appearance-none"><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select>
          </div>

          {/* Language */}
          <div className={`p-6 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-700' : 'border-blue-50'}`}>
            <div className="flex items-center gap-4"><div className="p-3 bg-emerald-50 text-emerald-400 rounded-2xl dark:bg-slate-700"><Globe size={20} /></div><span className="text-sm font-black">{t('language')}</span></div>
            <select 
              value={state.userProfile.language} 
              onChange={(e) => updateProfile({ language: e.target.value as AppLanguage })} 
              className="bg-transparent font-black text-emerald-500 outline-none text-sm appearance-none cursor-pointer"
            >
              {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
          </div>

          {/* Theme Color (Last) */}
          <div className={`p-6 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-700' : 'border-blue-50'}`}>
            <div className="flex items-center gap-4"><div className="p-3 bg-indigo-50 text-indigo-400 rounded-2xl dark:bg-slate-700"><Palette size={20} /></div><span className="text-sm font-black">{t('theme_color')}</span></div>
            <div className="flex gap-2">
               <button onClick={() => updateProfile({ themeColor: 'blue' })} className={`w-8 h-8 rounded-full bg-blue-400 border-4 ${state.userProfile.themeColor === 'blue' ? 'border-blue-600' : 'border-white'}`}></button>
               <button onClick={() => updateProfile({ themeColor: 'pink' })} className={`w-8 h-8 rounded-full bg-pink-400 border-4 ${state.userProfile.themeColor === 'pink' ? 'border-pink-600' : 'border-white'}`}></button>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full p-6 bg-slate-100 text-slate-400 rounded-[3rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all active:scale-95 dark:bg-slate-800 dark:text-slate-500"><LogOut size={20} /> Sign Out</button>
    </div>
  );
};
