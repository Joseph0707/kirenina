// ============================================
// Room Types — Kirenina
// ============================================

import type { GameType } from './game';

export interface Room {
  id: string;
  code: string;
  name: string;
  isPublic: boolean;
  gameType: GameType;
  maxPlayers: number;
  status: RoomStatus;
  creatorId: string;
  creatorUsername: string;
  players: RoomPlayer[];
  spectators: RoomSpectator[];
  allowSpectators: boolean;
  totalRounds: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomPlayer {
  playerId: string;
  username: string;
  avatarUrl?: string;
  isReady: boolean;
  isConnected: boolean;
}

export interface RoomSpectator {
  playerId: string;
  username: string;
}

export enum RoomStatus {
  WAITING = 'WAITING',
  STARTING = 'STARTING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export interface CreateRoomDto {
  name: string;
  isPublic: boolean;
  gameType: GameType;
  maxPlayers: number;
  totalRounds?: number;
  allowSpectators?: boolean;
}

export interface RoomListItem {
  id: string;
  name: string;
  gameType: GameType;
  maxPlayers: number;
  currentPlayers: number;
  status: RoomStatus;
  creatorUsername: string;
  createdAt: string;
}

export interface RoomFilters {
  gameType?: GameType;
  status?: RoomStatus;
  page?: number;
  limit?: number;
}
