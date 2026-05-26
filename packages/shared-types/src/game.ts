// ============================================
// Game Types — Kirenina
// ============================================

export enum GameType {
  RUMMY = 'RUMMY',
  // Futurs jeux à ajouter ici
}

export enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export interface Game {
  id: string;
  roomId: string;
  gameType: GameType;
  status: GameStatus;
  currentRound: number;
  totalRounds: number;
  startedAt: string;
  finishedAt?: string;
}

export interface GameScore {
  playerId: string;
  username: string;
  round: number;
  points: number;
  isWinner: boolean;
  isRummySec: boolean;
}

export interface GameResult {
  gameId: string;
  scores: GameScore[];
  finalRankings: FinalRanking[];
}

export interface FinalRanking {
  rank: number;
  playerId: string;
  username: string;
  totalPoints: number;
  roundsWon: number;
}

export interface GameInfo {
  type: GameType;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  icon: string;
}

export const GAME_INFO: Record<GameType, GameInfo> = {
  [GameType.RUMMY]: {
    type: GameType.RUMMY,
    name: 'Rami',
    description: 'Jeu de cartes à 104 cartes. Formez des combinaisons et débarrassez-vous de vos cartes !',
    minPlayers: 2,
    maxPlayers: 4,
    icon: '🃏',
  },
};
