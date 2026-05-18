
import { GameData, Player } from '../types';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

// Helper to check if the backend is actually alive
async function checkConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    await fetch(`${API_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return true;
  } catch (e) {
    return false;
  }
}

export const api = {
  async getGameStatus(gameId: string): Promise<GameData | null> {
    try {
      const res = await fetch(`${API_URL}/api/game/${gameId}`);
      if (!res.ok) throw new Error('Backend error');
      return await res.json();
    } catch (e) {
      const local = localStorage.getItem(`game_${gameId}`);
      return local ? JSON.parse(local) : null;
    }
  },

  async joinGame(gameId: string, name: string, team: string): Promise<Player> {
    try {
      const res = await fetch(`${API_URL}/api/game/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, team }),
      });
      return await res.json();
    } catch (e) {
      const mockPlayer: Player = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        teamId: team,
        status: 'PENDING',
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        avgBuzzerMs: 0
      };
      return mockPlayer;
    }
  },

  async postBuzz(gameId: string, playerId: string): Promise<void> {
    try {
      await fetch(`${API_URL}/api/game/${gameId}/buzz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, timestamp: Date.now() }),
      });
    } catch (e) {
      console.warn("API Offline: Buzz saved locally");
    }
  },

  async updateGameState(gameId: string, updates: Partial<GameData>): Promise<void> {
    // Persist locally regardless of backend status for immediate UI responsiveness
    const existing = localStorage.getItem(`game_${gameId}`);
    const data = existing ? JSON.parse(existing) : {};
    localStorage.setItem(`game_${gameId}`, JSON.stringify({ ...data, ...updates }));

    try {
      await fetch(`${API_URL}/api/game/${gameId}/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      // Silently fail if offline, as localStorage has already handled the update
    }
  }
};
