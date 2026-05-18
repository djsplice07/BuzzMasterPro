
export enum GameState {
  LOBBY = 'LOBBY',
  COUNTDOWN = 'COUNTDOWN',
  QUESTION = 'QUESTION',
  BUZZED = 'BUZZED',
  REVEAL = 'REVEAL',
  SCOREBOARD = 'SCOREBOARD',
  FINAL_STATS = 'FINAL_STATS'
}

export enum UserRole {
  HOST = 'HOST',
  PLAYER = 'PLAYER',
  SPECTATOR = 'SPECTATOR'
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  status: 'PENDING' | 'APPROVED';
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  avgBuzzerMs: number;
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface Question {
  id: string;
  text: string;
  answer: string;
  points: number;
  audioUrl?: string;
  audioStart?: number;
  audioEnd?: number;
}

export interface BuzzerLog {
  playerId: string;
  timestamp: number; // ms precision
}

export interface GameData {
  id: string;
  name: string;
  state: GameState;
  currentQuestionIndex: number;
  questions: Question[];
  players: Player[];
  teams: Team[];
  activeBuzzerQueue: BuzzerLog[];
  countdownValue: number;
}
