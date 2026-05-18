
import React from 'react';
import { GameData, GameState } from '../types';

interface SpectatorViewProps {
  game: GameData;
}

const SpectatorView: React.FC<SpectatorViewProps> = ({ game }) => {
  const currentQ = game.questions[game.currentQuestionIndex];

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center overflow-hidden p-12">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl h-full flex flex-col items-center justify-center text-center">
        
        {game.state === GameState.LOBBY && (
          <div className="space-y-12">
            <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              JOIN THE QUIZ!
            </h1>
            <div className="flex justify-center gap-12">
               <div className="p-8 bg-white rounded-3xl shadow-2xl">
                 {/* Simulate QR Code */}
                 <div className="w-48 h-48 bg-slate-900 rounded-xl flex items-center justify-center">
                   <div className="grid grid-cols-4 gap-2">
                     {[...Array(16)].map((_, i) => (
                       <div key={i} className={`w-6 h-6 rounded-sm ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`}></div>
                     ))}
                   </div>
                 </div>
               </div>
               <div className="text-left flex flex-col justify-center">
                 <div className="text-3xl font-bold opacity-60">Visit URL:</div>
                 <div className="text-5xl font-black text-blue-400">QUIZ.LIVE/BM-123</div>
               </div>
            </div>
            <div className="pt-12">
              <h3 className="text-2xl font-bold opacity-40 mb-4">PLAYERS JOINED:</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {game.players.filter(p => p.status === 'APPROVED').map(p => (
                  <span key={p.id} className="px-6 py-2 glass border border-white/10 rounded-full font-bold animate-bounce" style={{ animationDelay: `${Math.random()}s` }}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {game.state === GameState.COUNTDOWN && (
          <div className="text-[20rem] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-indigo-800 animate-ping">
            {game.countdownValue}
          </div>
        )}

        {game.state === GameState.QUESTION && (
          <div className="space-y-12 animate-in fade-in zoom-in duration-500">
            <div className="px-8 py-4 bg-blue-600 rounded-2xl text-2xl font-bold inline-block">QUESTION {game.currentQuestionIndex + 1}</div>
            <h2 className="text-7xl font-bold leading-tight drop-shadow-2xl">
              {currentQ.text}
            </h2>
            <div className="text-3xl font-bold text-white/40 italic">Waiting for buzzers...</div>
          </div>
        )}

        {game.state === GameState.BUZZED && (
          <div className="space-y-12 w-full">
            <h2 className="text-4xl opacity-50 font-bold">{currentQ.text}</h2>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold mb-4 px-6 py-2 bg-yellow-500 rounded-xl text-slate-900">PLAYER BUZZED!</div>
              <div className="text-9xl font-black text-white px-12 py-8 bg-blue-600 rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.6)] border-8 border-blue-400">
                 {game.players.find(p => p.id === game.activeBuzzerQueue[0]?.playerId)?.name || 'Someone'}
              </div>
            </div>
          </div>
        )}

        {game.state === GameState.REVEAL && (
          <div className="space-y-12 text-center animate-in slide-in-from-bottom duration-700">
            <h2 className="text-4xl opacity-50 font-bold">THE ANSWER IS...</h2>
            <div className="text-9xl font-black text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.5)]">
              {currentQ.answer}
            </div>
            <div className="text-4xl font-bold text-white">Points awarded to {game.players.find(p => p.id === game.activeBuzzerQueue[0]?.playerId)?.teamId}!</div>
          </div>
        )}

        {game.state === GameState.SCOREBOARD && (
          <div className="w-full max-w-4xl space-y-8">
            <h2 className="text-6xl font-black mb-12 italic tracking-tighter underline decoration-blue-500 underline-offset-8">LEADERBOARD</h2>
            <div className="space-y-4">
              {game.players
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-6 glass rounded-2xl border border-white/10 shadow-xl overflow-hidden relative">
                   <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500"></div>
                   <div className="flex items-center gap-6">
                     <span className="text-4xl font-black opacity-20">{i+1}</span>
                     <span className="text-3xl font-bold">{p.name}</span>
                     <span className="text-xl opacity-40">({p.teamId})</span>
                   </div>
                   <div className="text-4xl font-black text-blue-400">{p.score} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {game.state === GameState.FINAL_STATS && (
           <div className="space-y-12 w-full">
              <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">GAME OVER!</h1>
              <div className="grid grid-cols-3 gap-8">
                 <StatBox label="The Flash" sub="Fastest Buzzer" value="Sarah" />
                 <StatBox label="The Brain" sub="Most Correct" value="John" />
                 <StatBox label="The Guesser" sub="Most Misses" value="Mike" />
              </div>
              <div className="mt-12 p-8 glass rounded-[3rem] border border-white/20">
                 <h2 className="text-4xl font-bold mb-4">🏆 FINAL CHAMPIONS 🏆</h2>
                 <div className="text-7xl font-black text-blue-400 uppercase">THE NERDS</div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; sub: string; value: string }> = ({ label, sub, value }) => (
  <div className="glass p-8 rounded-3xl border border-white/5 space-y-2">
    <div className="text-sm font-bold text-blue-400 uppercase tracking-widest">{sub}</div>
    <div className="text-xl font-bold opacity-60">{label}</div>
    <div className="text-4xl font-black">{value}</div>
  </div>
);

export default SpectatorView;
