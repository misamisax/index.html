
import React, { useState, useRef, useEffect } from 'react';
import { getZenBuddyResponse } from '../services/geminiService';
import { ChatMessage, AppState } from '../types';
import { Send, Sparkles, CloudMoon } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
    language: string;
}

export const ZenBuddyChat: React.FC<Props> = ({ language }) => {
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hiiii! I'm CinnamoCoach! 🐰☁️ Feeling like a snack? Let's talk about the clouds or your progress instead!", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getZenBuddyResponse(
        messages.map(m => ({ role: m.role, text: m.text })),
        input
      );
      setMessages(prev => [...prev, { role: 'model', text: response || "I'm right here with you!", timestamp: Date.now() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[550px] bg-white rounded-[3.5rem] shadow-sm border border-blue-50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-6 flex items-center gap-3 text-white">
        <div className="bg-white/20 p-2.5 rounded-[1.2rem] shadow-inner">
          <CloudMoon size={24} />
        </div>
        <div>
          <h3 className="font-black text-lg tracking-tight">{t('coach_name')}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">{t('coach_desc')}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FBFF]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-[1.8rem] text-sm font-medium leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-blue-50 rounded-tl-none'
            }`}>
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-[1.8rem] shadow-sm border border-blue-50 animate-pulse">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-blue-50">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setInput("I'm having a hard time...")} className="whitespace-nowrap px-4 py-2 bg-blue-50 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-100 transition-all">Support</button>
          <button onClick={() => setInput("Tell me a cloud story.")} className="whitespace-nowrap px-4 py-2 bg-blue-50 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-100 transition-all">Cloud Story</button>
          <button onClick={() => setInput("Encourage me!")} className="whitespace-nowrap px-4 py-2 bg-blue-50 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-100 transition-all">Encourage</button>
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Talk to CinnamoCoach..."
            className="flex-1 px-5 py-3 bg-slate-50 rounded-2xl text-sm font-medium focus:outline-none border-2 border-transparent focus:border-blue-200 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
