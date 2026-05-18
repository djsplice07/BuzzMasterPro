
import React, { useState } from 'react';
import { GameData, GameState, Player } from '../types';

interface PlayerViewProps {
  game: GameData;
  updateGame: (data: Partial<GameData>) => void;
  currentUser: Player | null;
  setCurrentUser: (p: Player) => void;
}

const PlayerView: React.FC<PlayerViewProps> = ({ game, updateGame, currentUser, setCurrentUser }) => {
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !teamName) return;
    
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      teamId: teamName, // Simplified team logic
      status: 'PENDING',
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      avgBuzzerMs: 0
    };
    
    setCurrentUser(newPlayer);
    updateGame({ players: [...game.players, newPlayer] });
  };

  const handleBuzz = () => {
    if (!currentUser || game.state !== GameState.QUESTION) return;
    
    const timestamp = Date.now();
    const alreadyBuzzed = game.activeBuzzerQueue.some(b => b.playerId === currentUser.id);
    
    if (!alreadyBuzzed) {
      updateGame({
        state: GameState.BUZZED,
        activeBuzzerQueue: [...game.activeBuzzerQueue, { playerId: currentUser.id, timestamp }]
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-slate-950">
        <form onSubmit={handleJoin} className="w-full max-w-sm space-y-4 glass p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold text-center mb-6">Join the Game</h2>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Your Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Team Name</label>
            <input 
              type="text" 
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. The Nerds"
            />
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 rounded-xl font-bold text-lg hover:bg-blue-500 transition-colors">
            Enter Lobby
          </button>
        </form>
      </div>
    );
  }

  if (currentUser.status === 'PENDING') {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-screen text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Waiting for Host...</h2>
        <p className="opacity-70">Hang tight, {currentUser.name}! The host will approve you shortly.</p>
      </div>
    );
  }

  const isFirst = game.activeBuzzerQueue[0]?.playerId === currentUser.id;
  const hasBuzzed = game.activeBuzzerQueue.some(b => b.playerId === currentUser.id);

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-slate-900 overflow-hidden">
      <div className="w-full flex justify-between items-center mb-8 px-4 py-2 glass rounded-2xl border border-white/5">
        <div className="font-bold">{currentUser.name}</div>
        <div className="text-blue-400 font-bold">{teamName}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {game.state === GameState.LOBBY && (
          <div className="text-center italic opacity-60">Game will start soon...</div>
        )}

        {game.state === GameState.COUNTDOWN && (
          <div className="text-8xl font-black text-blue-500 animate-bounce">{game.countdownValue}</div>
        )}

        {game.state === GameState.QUESTION && (
          <button 
            onClick={handleBuzz}
            className="w-64 h-64 rounded-full bg-red-600 shadow-2xl active:scale-90 transition-all border-[12px] border-red-800 buzzer-ready flex items-center justify-center text-3xl font-black italic uppercase"
          >
            BUZZ!
          </button>
        )}

        {game.state === GameState.BUZZED && (
          <div className={`w-64 h-64 rounded-full flex items-center justify-center text-2xl font-bold border-[12px] ${isFirst ? 'bg-green-600 border-green-800' : 'bg-slate-700 border-slate-800 opacity-50'}`}>
            {isFirst ? 'YOUR TURN!' : hasBuzzed ? 'LOCKED' : 'WAITING'}
          </div>
        )}

        {(game.state === GameState.REVEAL || game.state === GameState.SCOREBOARD) && (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Well Played!</h3>
            <p className="opacity-60">Get ready for the next one.</p>
          </div>
        )}
      </div>
      
      <div className="w-full mt-4 text-center text-xs opacity-40">
        Lat: ~15ms
      </div>
    </div>
  );
};

export default PlayerView;
