
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import PlayerView from './components/PlayerView';
import AdminDashboard from './components/AdminDashboard';
import SpectatorView from './components/SpectatorView';
import { GameData, GameState, UserRole } from './types';
import { api } from './services/api';

const INITIAL_GAME_DATA: GameData = {
  id: 'game-123',
  name: 'Trivia Night 2024',
  state: GameState.LOBBY,
  currentQuestionIndex: 0,
  questions: [
    { id: 'q1', text: 'What is the capital of France?', answer: 'Paris', points: 100 },
    { id: 'q2', text: 'Which planet is known as the Red Planet?', answer: 'Mars', points: 150 },
    { id: 'q3', text: 'Who wrote "Romeo and Juliet"?', answer: 'William Shakespeare', points: 200 },
  ],
  players: [],
  teams: [],
  activeBuzzerQueue: [],
  countdownValue: 3,
};

const App: React.FC = () => {
  const [game, setGame] = useState<GameData>(() => {
    const saved = localStorage.getItem(`game_${INITIAL_GAME_DATA.id}`);
    return saved ? JSON.parse(saved) : INITIAL_GAME_DATA;
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSynced, setIsSynced] = useState(false);
  const [useLocal, setUseLocal] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await api.getGameStatus(game.id);
        if (data) {
          setGame(prev => ({ ...prev, ...data }));
          setIsSynced(true);
          setUseLocal(false);
        } else {
          setIsSynced(false);
          setUseLocal(true);
        }
      } catch (e) {
        setIsSynced(false);
        setUseLocal(true);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [game.id]);

  const updateGame = async (newData: Partial<GameData>) => {
    const updated = { ...game, ...newData };
    setGame(updated);
    // This updates localStorage internally and attempts the API call
    await api.updateGameState(game.id, newData);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 overflow-hidden text-white">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/player" 
            element={<PlayerView game={game} updateGame={updateGame} currentUser={currentUser} setCurrentUser={setCurrentUser} />} 
          />
          <Route 
            path="/admin" 
            element={<AdminDashboard game={game} updateGame={updateGame} />} 
          />
          <Route 
            path="/spectator" 
            element={<SpectatorView game={game} />} 
          />
        </Routes>
      </HashRouter>
      
      <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] uppercase tracking-widest z-50">
        <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : useLocal ? 'bg-orange-500' : 'bg-red-500 animate-pulse'}`}></div>
        {isSynced ? 'Container Synced' : useLocal ? 'Local Cache Mode' : 'Connecting...'}
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative">
      <div className="absolute top-10 text-xs font-mono opacity-30 tracking-[0.2em]">BUZZMASTER // SYSTEM_DOCKER_V1</div>
      
      <div className="relative mb-16">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 italic tracking-tighter">
          BUZZMASTER <span className="text-white not-italic font-thin">PRO</span>
        </h1>
        <div className="absolute -bottom-2 right-0 text-[10px] font-bold bg-blue-600 px-2 py-0.5 rounded text-white tracking-widest">
          ENTERPRISE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <RoleCard 
          title="Host" 
          desc="Command Center" 
          node="admin-node-01"
          color="bg-indigo-600" 
          onClick={() => navigate('/admin')}
        />
        <RoleCard 
          title="Player" 
          desc="Client Interface" 
          node="client-endpoint"
          color="bg-sky-600" 
          onClick={() => navigate('/player')}
        />
        <RoleCard 
          title="Display" 
          desc="Public Broadcast" 
          node="render-engine"
          color="bg-emerald-600" 
          onClick={() => navigate('/spectator')}
        />
      </div>

      <div className="mt-20 opacity-20 text-[10px] font-mono max-w-xl text-center">
        DOCKER_SERVICE_DISCOVERY: ENABLED | DB_DRIVER: MARIADB_10.11 | PERSISTENCE_STRATEGY: HYBRID_LOCAL_REMOTE
      </div>
    </div>
  );
};

const RoleCard: React.FC<{ title: string; desc: string; node: string; color: string; onClick: () => void }> = ({ title, desc, node, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`${color} p-10 rounded-[2.5rem] shadow-2xl hover:-translate-y-2 active:scale-95 transition-all text-left border border-white/20 group relative overflow-hidden`}
  >
    <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-500">
      <svg width="160" height="160" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    </div>
    <div className="relative z-10">
      <div className="text-[10px] font-mono opacity-50 mb-4 tracking-widest">{node}</div>
      <h2 className="text-4xl font-black mb-1 uppercase tracking-tighter italic">{title}</h2>
      <p className="text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">{desc}</p>
    </div>
  </button>
);

export default App;
