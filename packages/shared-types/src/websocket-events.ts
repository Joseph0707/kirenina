// ============================================
// WebSocket Events — Kirenina
// ============================================

import type { Room, RoomPlayer, RoomSpectator, CreateRoomDto, RoomListItem } from './room';
import type { Card, Meld, RummyClientState, RoundScore, RummySpecialRules } from './rummy';
import type { GameResult } from './game';

// ============================================
// Client → Serveur
// ============================================

export interface ClientToServerEvents {
  // --- Room events ---
  'room:create': (data: CreateRoomDto & { specialRules?: Partial<RummySpecialRules> }) => void;
  'room:join': (data: { roomId: string }) => void;
  'room:joinByCode': (data: { code: string }) => void;
  'room:leave': (data: { roomId: string }) => void;
  'room:ready': (data: { roomId: string }) => void;
  'room:unready': (data: { roomId: string }) => void;
  'room:startGame': (data: { roomId: string }) => void;
  'room:spectate': (data: { roomId: string }) => void;

  // --- Game events ---
  'game:draw': (data: { source: 'deck' | 'discard' }) => void;
  'game:meld': (data: { cards: Card[] }) => void;
  'game:addToMeld': (data: { meldId: string; card: Card }) => void;
  'game:swapJoker': (data: { meldId: string; jokerCardId: string; replacementCard: Card }) => void;
  'game:discard': (data: { card: Card }) => void;
  'game:knock': () => void; // Frappe (règle spéciale)

  // --- Chat events ---
  'chat:message': (data: { roomId: string; message: string }) => void;

  // --- Lobby events ---
  'lobby:subscribe': (data: { gameType: string }) => void;
  'lobby:unsubscribe': () => void;
}

// ============================================
// Serveur → Client
// ============================================

export interface ServerToClientEvents {
  // --- Room events ---
  'room:created': (data: { room: Room }) => void;
  'room:updated': (data: { room: Room }) => void;
  'room:playerJoined': (data: { player: RoomPlayer }) => void;
  'room:playerLeft': (data: { playerId: string }) => void;
  'room:playerReady': (data: { playerId: string; isReady: boolean }) => void;
  'room:spectatorJoined': (data: { spectator: RoomSpectator }) => void;
  'room:spectatorLeft': (data: { playerId: string }) => void;
  'room:countdown': (data: { seconds: number }) => void;
  'room:error': (data: { message: string; code: string }) => void;

  // --- Game events ---
  'game:started': (data: { state: RummyClientState }) => void;
  'game:stateUpdate': (data: { state: RummyClientState }) => void;
  'game:cardDrawn': (data: { playerId: string; source: 'deck' | 'discard'; card?: Card }) => void;
  'game:meldPlayed': (data: { playerId: string; meld: Meld }) => void;
  'game:cardAddedToMeld': (data: { playerId: string; meldId: string; card: Card; updatedMeld: Meld }) => void;
  'game:jokerSwapped': (data: { playerId: string; meldId: string; updatedMeld: Meld }) => void;
  'game:cardDiscarded': (data: { playerId: string; card: Card }) => void;
  'game:turnChanged': (data: { currentPlayerId: string; currentPlayerIndex: number; phase: string }) => void;
  'game:roundEnd': (data: { round: number; scores: RoundScore[]; winnerId: string | null }) => void;
  'game:finished': (data: { result: GameResult }) => void;
  'game:playerDisconnected': (data: { playerId: string; graceSeconds: number }) => void;
  'game:playerReconnected': (data: { playerId: string }) => void;
  'game:autoDiscard': (data: { playerId: string; card: Card }) => void;
  'game:error': (data: { message: string; code: string }) => void;
  'game:knocked': (data: { playerId: string; card: Card }) => void;

  // --- Chat events ---
  'chat:message': (data: ChatMessage) => void;

  // --- Lobby events ---
  'lobby:roomsList': (data: { rooms: RoomListItem[] }) => void;
  'lobby:roomAdded': (data: { room: RoomListItem }) => void;
  'lobby:roomUpdated': (data: { room: RoomListItem }) => void;
  'lobby:roomRemoved': (data: { roomId: string }) => void;
}

// ============================================
// Chat
// ============================================

export interface ChatMessage {
  id: string;
  roomId: string;
  playerId: string;
  username: string;
  message: string;
  timestamp: string;
}
