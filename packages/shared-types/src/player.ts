// ============================================
// Player Types — Kirenina
// ============================================

export interface Player {
  id: string;
  deviceId: string;
  username: string;
  avatarUrl?: string;
  isPublic: boolean;
  totalPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  medal: Medal;
  createdAt: string;
  updatedAt: string;
}

export enum Medal {
  NONE = 'NONE',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  isPublic: boolean;
  totalPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  medal: Medal;
  winRate: number; // Calculé: gamesWon / gamesPlayed
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  avatarUrl?: string;
  totalPoints: number;
  gamesWon: number;
  medal: Medal;
}

export interface CreatePlayerDto {
  deviceId: string;
  username: string;
}

export interface UpdatePlayerDto {
  username?: string;
  avatarUrl?: string;
  isPublic?: boolean;
}
