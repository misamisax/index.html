
import React, { useState, useEffect } from 'react';
import { Gamepad2, RotateCcw, Brain, Wind, Palette } from 'lucide-react';

type GameMode = 'COLOR' | 'BREATH' | 'MATH';

export const DistractionGame: React.FC = () => {
  const [activeMode, setActiveMode] = useState<GameMode>('COLOR');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'OVER'>('IDLE');

  // Mode States
  const [colorGame, setColorGame] = useState({ target: '', options: [] as string[] });
  const [mathGame, setMathGame] = useState({ question: '', answer: 0, options: [] as number[] });
  const [breathStage, setBreathStage] = useState<'IN' | 'HOLD' | 'OUT'>('IN');

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];

  const initColorGame = () => {
    const target = colors[Math.floor(Math.random() * colors.length)];
    setColorGame({ target, options: [...colors].sort(() => Math.random() - 0.5) });
  };

  const initMathGame = () => {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const ans = a + b;
    const opts = [ans, ans + 2, ans - 1, ans + 5].sort(() => Math.random() - 0.5);
    setMathGame({ question: `${a} + ${b} = ?`, answer: ans, options: opts });
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'PLAYING') {
      setGameState('OVER');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Breathing Logic (Infinite while in game)
  useEffect(() => {
    if (activeMode === 'BREATH' && gameState === 'PLAYING') {
      const breathTimer = setInterval(() => {
        setBreathStage(prev => {
          if (prev === 'IN') return 'HOLD';
          if (prev === 'HOLD') return 'OUT';
          return 'IN';
        });
      }, 4000);
      return () => clearInterval(breathTimer);
    }
  }, [activeMode, gameState]);

  const handleStart = () => {
    setScore(0);
    setTimeLeft(activeMode === 'BREATH' ? 60 : 30);
    setGameState('PLAYING');
    if (activeMode === 'COLOR') initColorGame();
    if (activeMode === 'MATH') initMathGame();
  };

  const handleColorClick = (color: string) => {
    if (color === colorGame.target) {
      setScore(s => s + 1);
      initColorGame();
    } else {
      setScore(s => Math.max(0, s - 1));
    }
  };

  const handleMathClick = (val: number) => {
    if (val === mathGame.answer) {
      setScore(s => s + 1);
      initMathGame();
    } else {
      setScore(s => Math.max(0, s - 1));
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            <Gamepad2 size={20} />
          </div>
          <h3 className="font-bold text-lg text-gray-800">Crave Distractions</h3>
        </div>
        {gameState === 'IDLE' && (
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setActiveMode('COLOR')} className={`p-2 rounded-lg transition-all ${activeMode === 'COLOR' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-400'}`}><Palette size={16} /></button>
            <button onClick={() => setActiveMode('BREATH')} className={`p-2 rounded-lg transition-all ${activeMode === 'BREATH' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-400'}`}><Wind size={16} /></button>
            <button onClick={() => setActiveMode('MATH')} className={`p-2 rounded-lg transition-all ${activeMode === 'MATH' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-400'}`}><Brain size={16} /></button>
          </div>
        )}
      </div>

      {gameState === 'IDLE' && (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-500 mb-6">
            {activeMode === 'COLOR' && "Match the colors to engage your visual cortex."}
            {activeMode === 'BREATH' && "Follow the rhythm to calm your nervous system."}
            {activeMode === 'MATH' && "Solve equations to shift focus to your logic brain."}
          </p>
          <button onClick={handleStart} className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all">
            Start {activeMode.charAt(0) + activeMode.slice(1).toLowerCase()} Focus
          </button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {activeMode !== 'BREATH' ? `Score: ${score}` : 'Just Breathe'}
            </span>
            <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-lg">{timeLeft}s</span>
          </div>

          {activeMode === 'COLOR' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className={`w-24 h-24 rounded-3xl ${colorGame.target} shadow-inner transition-colors duration-200`}></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {colorGame.options.map((c, i) => (
                  <button key={i} onClick={() => handleColorClick(c)} className={`h-16 rounded-2xl ${c} active:scale-90 transition-transform`} />
                ))}
              </div>
            </div>
          )}

          {activeMode === 'MATH' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 text-center">
              <div className="text-4xl font-black text-slate-800 mb-8 p-6 bg-slate-50 rounded-3xl">{mathGame.question}</div>
              <div className="grid grid-cols-2 gap-3">
                {mathGame.options.map((v, i) => (
                  <button key={i} onClick={() => handleMathClick(v)} className="py-4 bg-white border-2 border-slate-100 hover:border-pink-200 text-slate-800 font-bold rounded-2xl active:scale-95 transition-all">
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMode === 'BREATH' && (
            <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-95">
              <div className={`w-40 h-40 rounded-full border-4 border-pink-100 flex items-center justify-center transition-all duration-[4000ms] ease-in-out transform ${breathStage === 'IN' ? 'scale-125 bg-pink-50' : breathStage === 'OUT' ? 'scale-75 bg-white' : 'scale-110 bg-pink-50/50'}`}>
                <span className="font-bold text-pink-600 text-lg uppercase tracking-widest">
                  {breathStage === 'IN' && 'Inhale'}
                  {breathStage === 'HOLD' && 'Hold'}
                  {breathStage === 'OUT' && 'Exhale'}
                </span>
              </div>
              <p className="mt-8 text-slate-400 text-sm italic">Let the hunger pass with your breath...</p>
            </div>
          )}
        </div>
      )}

      {gameState === 'OVER' && (
        <div className="py-8 text-center animate-in zoom-in-95 duration-300">
          <h4 className="text-2xl font-bold text-pink-600 mb-2">Well Done!</h4>
          <p className="text-gray-500 mb-6 px-4">You diverted your attention for {activeMode === 'BREATH' ? '60' : '30'} seconds. Still craving? Try another round or drink some water.</p>
          {activeMode !== 'BREATH' && <div className="text-4xl font-black text-gray-800 mb-8">{score} pts</div>}
          <button onClick={() => setGameState('IDLE')} className="flex items-center gap-2 mx-auto px-8 py-3 bg-slate-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-all">
            <RotateCcw size={18} /> Menu
          </button>
        </div>
      )}
    </div>
  );
};
