
import React, { useState } from 'react';
import { GameData, GameState, Player, Question } from '../types';

interface AdminDashboardProps {
  game: GameData;
  updateGame: (data: Partial<GameData>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ game, updateGame }) => {
  const [activeTab, setActiveTab] = useState<'control' | 'lobby' | 'questions'>('control');

  const approvePlayer = (id: string) => {
    const updated = game.players.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p);
    updateGame({ players: updated as Player[] });
  };

  const startGame = () => {
    updateGame({ state: GameState.LOBBY });
  };

  const startCountdown = () => {
    updateGame({ state: GameState.COUNTDOWN, countdownValue: 3 });
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        updateGame({ state: GameState.QUESTION, countdownValue: 0, activeBuzzerQueue: [] });
      } else {
        updateGame({ countdownValue: count });
      }
    }, 1000);
  };

  const adjudicate = (isCorrect: boolean) => {
    const firstBuzzer = game.activeBuzzerQueue[0];
    if (!firstBuzzer) return;

    const currentQ = game.questions[game.currentQuestionIndex];
    
    if (isCorrect) {
      const updatedPlayers = game.players.map(p => {
        if (p.id === firstBuzzer.playerId) {
          return { ...p, score: p.score + currentQ.points, correctAnswers: p.correctAnswers + 1 };
        }
        return p;
      });
      updateGame({ 
        state: GameState.REVEAL, 
        players: updatedPlayers as Player[] 
      });
    } else {
      const updatedQueue = game.activeBuzzerQueue.slice(1);
      const updatedPlayers = game.players.map(p => {
        if (p.id === firstBuzzer.playerId) {
          return { ...p, wrongAnswers: p.wrongAnswers + 1 };
        }
        return p;
      });
      updateGame({ 
        activeBuzzerQueue: updatedQueue,
        players: updatedPlayers as Player[]
      });
    }
  };

  const nextQuestion = () => {
    const nextIdx = game.currentQuestionIndex + 1;
    if (nextIdx >= game.questions.length) {
      updateGame({ state: GameState.FINAL_STATS });
    } else {
      updateGame({ state: GameState.SCOREBOARD, currentQuestionIndex: nextIdx });
    }
  };

  const currentQ = game.questions[game.currentQuestionIndex];

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-950 border-r border-white/5 flex flex-col">
        <div className="p-6 font-bold text-xl border-b border-white/5">HOST PANEL</div>
        <nav className="flex-1 p-4 space-y-2">
          <NavBtn active={activeTab === 'control'} onClick={() => setActiveTab('control')} label="Control Center" />
          <NavBtn active={activeTab === 'lobby'} onClick={() => setActiveTab('lobby')} label="Lobby & Players" />
          <NavBtn active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} label="Question List" />
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <SoundBtn label="DING" color="bg-green-600" />
          <SoundBtn label="BUZZ" color="bg-red-600" />
        </div>
      </div>

      {/* Main Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'lobby' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Lobby Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {game.players.map(p => (
                <div key={p.id} className="glass p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-sm opacity-50">Team: {p.teamId}</div>
                  </div>
                  {p.status === 'PENDING' ? (
                    <button onClick={() => approvePlayer(p.id)} className="px-4 py-2 bg-blue-600 rounded-lg text-sm">Approve</button>
                  ) : (
                    <span className="text-green-500 text-sm font-bold">ACTIVE</span>
                  )}
                </div>
              ))}
            </div>
            {game.state === GameState.LOBBY && (
               <button onClick={startGame} className="px-8 py-3 bg-indigo-600 rounded-xl font-bold">Finalize Lobby & Start</button>
            )}
          </div>
        )}

        {activeTab === 'control' && (
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-black mb-2">Question {game.currentQuestionIndex + 1}</h2>
                <p className="text-xl opacity-70 max-w-2xl">{currentQ.text}</p>
                <p className="text-green-400 mt-2 font-bold">A: {currentQ.answer}</p>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-50">Points Value</div>
                <div className="text-3xl font-bold">{currentQ.points}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-xl font-bold border-b border-white/5 pb-2">Game Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={game.state !== GameState.SCOREBOARD && game.state !== GameState.LOBBY}
                    onClick={startCountdown} 
                    className="p-6 bg-blue-600 disabled:opacity-30 rounded-2xl font-bold"
                  >
                    START COUNTDOWN
                  </button>
                  <button 
                    disabled={game.state !== GameState.REVEAL}
                    onClick={nextQuestion}
                    className="p-6 bg-indigo-600 disabled:opacity-30 rounded-2xl font-bold"
                  >
                    NEXT SLIDE
                  </button>
                </div>
                
                <div className="space-y-2 mt-4">
                   <h4 className="text-sm font-bold opacity-50">Adjudication</h4>
                   <div className="flex gap-4">
                     <button onClick={() => adjudicate(true)} className="flex-1 py-4 bg-green-600 rounded-xl font-bold">CORRECT</button>
                     <button onClick={() => adjudicate(false)} className="flex-1 py-4 bg-red-600 rounded-xl font-bold">WRONG</button>
                   </div>
                </div>
              </div>

              {/* Buzzer Queue */}
              <div className="glass p-6 rounded-3xl border border-white/10">
                 <h3 className="text-xl font-bold border-b border-white/5 pb-2 mb-4">Buzzer Queue</h3>
                 <div className="space-y-3">
                   {game.activeBuzzerQueue.length === 0 && <div className="text-center py-8 opacity-40">Waiting for buzzes...</div>}
                   {game.activeBuzzerQueue.map((buzz, i) => {
                     const p = game.players.find(pl => pl.id === buzz.playerId);
                     return (
                       <div key={buzz.playerId} className={`p-4 rounded-xl flex justify-between items-center ${i === 0 ? 'bg-green-500/20 border border-green-500/50' : 'bg-white/5'}`}>
                         <div className="flex items-center gap-3">
                           <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">{i + 1}</span>
                           <span className="font-bold">{p?.name || 'Unknown'}</span>
                         </div>
                         <div className="text-xs opacity-50">{buzz.timestamp % 10000}ms</div>
                       </div>
                     );
                   })}
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white font-bold' : 'hover:bg-white/5 text-white/60'}`}
  >
    {label}
  </button>
);

const SoundBtn: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <button className={`w-full py-2 ${color} rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-transform`}>
    {label}
  </button>
);

export default AdminDashboard;
