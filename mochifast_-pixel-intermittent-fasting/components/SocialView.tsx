
import React, { useState, useMemo } from 'react';
import { Users, Send, Gift, Sparkles, UserPlus, Copy, Bell, Star, Moon, Check, MessageCircle, Smile, Heart, ArrowUp, ArrowDown, X } from 'lucide-react';
import { AppState, Buddy, SocialNotification } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  buddies: Buddy[];
  collectedItems: number;
  notifications: SocialNotification[];
  inviteCode: string;
  onSendAction: (buddyId: string, type: 'star' | 'moon' | 'message', content?: string) => void;
  onAddBuddy: (name: string, inviteCode?: string) => void;
  onClearNotification: (id: string) => void;
  onUpdateBuddy: (buddyId: string, updates: Partial<Buddy>) => void;
  onReorderBuddies: (newBuddies: Buddy[]) => void;
  isDarkMode: boolean;
  language: string;
}

export const SocialView: React.FC<Props> = ({ 
  buddies, collectedItems, notifications, inviteCode, onSendAction, 
  onAddBuddy, onClearNotification, onUpdateBuddy, onReorderBuddies, 
  isDarkMode, language 
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [activeBuddyChat, setActiveBuddyChat] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');
  
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;
  const emojis = ['🐰', '✨', '🥕', '🥗', '🌙', '💪', '❤️', '🔥', '☁️', '🍮', '⭐'];

  const sortedBuddies = useMemo(() => {
    return [...buddies].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.order - b.order;
    });
  }, [buddies]);

  const handleMove = (id: string, dir: number) => {
    const idx = sortedBuddies.findIndex(b => b.id === id);
    if ((idx === 0 && dir === -1) || (idx === sortedBuddies.length - 1 && dir === 1)) return;
    const newOrder = [...sortedBuddies];
    const temp = newOrder[idx];
    newOrder[idx] = newOrder[idx + dir];
    newOrder[idx + dir] = temp;
    const updated = newOrder.map((b, i) => ({ ...b, order: i }));
    onReorderBuddies(updated);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    if (searchInput.startsWith('MOCHI-')) {
       onAddBuddy("Friend", searchInput);
    } else {
       onAddBuddy(searchInput);
    }
    setSearchInput('');
  };

  const handleSendMessage = () => {
    if (!msgInput.trim() || !activeBuddyChat) return;
    onSendAction(activeBuddyChat, 'message', msgInput);
    setMsgInput('');
    setActiveBuddyChat(null);
  };

  const activeBuddy = buddies.find(b => b.id === activeBuddyChat);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className={`p-6 rounded-[3rem] shadow-xl transition-all ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users size={24} />
            <h3 className="font-black text-xl">{t('buddies')}</h3>
          </div>
          <div className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
            <Moon size={12} fill="currentColor" /> {collectedItems} Shards
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-[2.5rem] shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-50'}`}>
        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 px-2">Add by ID or Invite Code</p>
        <form onSubmit={handleAddFriend} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Name or MOCHI-XXXXXX..." 
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className={`flex-1 px-5 py-3 rounded-[1.5rem] text-xs font-bold outline-none border-2 border-transparent focus:border-blue-400 transition-all ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-50'}`}
          />
          <button type="submit" className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-lg shadow-blue-100 hover:bg-blue-700">
            <UserPlus size={20} />
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-8">Circle Members</h4>
        {sortedBuddies.map((buddy) => {
          const hasNotif = notifications.some(n => n.from === buddy.name && !n.read);
          return (
            <div key={buddy.id} className={`p-6 rounded-[3rem] shadow-sm border transition-all relative ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'} ${hasNotif ? 'ring-2 ring-blue-400 border-blue-200 shadow-blue-100' : ''}`}>
              {hasNotif && <div className="absolute top-2 right-8 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-xl font-black transition-all ${buddy.isOnline ? 'bg-blue-100 text-blue-500 ring-2 ring-emerald-400' : 'bg-slate-100 text-slate-400 grayscale'}`}>
                    {buddy.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className={`font-black text-base flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {buddy.name} 
                      <button onClick={() => onUpdateBuddy(buddy.id, { isFavorite: !buddy.isFavorite })}>
                        <Heart size={16} fill={buddy.isFavorite ? "currentColor" : "none"} className={buddy.isFavorite ? "text-rose-500" : "text-slate-300"} />
                      </button>
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">🔥 {buddy.streak} DAY STREAK</span>
                      {buddy.isFasting && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-500 text-[8px] font-black rounded-full uppercase">Fasting</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                   <button onClick={() => handleMove(buddy.id, -1)} className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-700"><ArrowUp size={14}/></button>
                   <button onClick={() => handleMove(buddy.id, 1)} className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-700"><ArrowDown size={14}/></button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => onSendAction(buddy.id, 'star')} className="flex flex-col items-center justify-center gap-1 py-3 bg-yellow-50 text-yellow-600 rounded-2xl text-[9px] font-black uppercase hover:bg-yellow-100 transition-colors">
                  <Star size={18} fill="currentColor"/> {t('stars_btn')}
                </button>
                <button onClick={() => onSendAction(buddy.id, 'moon')} disabled={collectedItems === 0} className="flex flex-col items-center justify-center gap-1 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[9px] font-black uppercase hover:bg-indigo-100 disabled:opacity-50">
                  <Moon size={18} fill="currentColor"/> {t('moon_btn')}
                </button>
                <button onClick={() => setActiveBuddyChat(buddy.id)} className="flex flex-col items-center justify-center gap-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[9px] font-black uppercase hover:bg-emerald-100">
                  <MessageCircle size={18}/> Chat
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Modal */}
      {activeBuddyChat && activeBuddy && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end justify-center animate-in slide-in-from-bottom-full duration-300">
           <div className={`w-full max-w-md p-8 rounded-t-[3.5rem] shadow-2xl relative transition-all ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <button onClick={() => setActiveBuddyChat(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 font-black">{activeBuddy.name.charAt(0)}</div>
                <div>
                  <h4 className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Chat with {activeBuddy.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEND A QUICK MOCHI GREETING</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {emojis.map(e => (
                  <button key={e} onClick={() => setMsgInput(prev => prev + e)} className="text-2xl p-2 bg-slate-50 rounded-xl hover:bg-blue-50 transition-all active:scale-90 dark:bg-slate-700">{e}</button>
                ))}
              </div>

              <div className="flex gap-3">
                <input 
                  value={msgInput} 
                  onChange={e => setMsgInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..." 
                  className={`flex-1 p-5 rounded-[2rem] text-sm font-bold border-2 border-transparent focus:border-blue-400 outline-none transition-all ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-50'}`}
                  autoFocus
                />
                <button onClick={handleSendMessage} className="p-5 bg-blue-500 text-white rounded-[2rem] shadow-xl hover:bg-blue-600 active:scale-95 transition-all">
                  <Send size={24}/>
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
