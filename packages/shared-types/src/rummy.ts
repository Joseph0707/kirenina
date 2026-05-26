// ============================================
// Rummy (Rami) Types — Kirenina
// ============================================

// --- Cartes ---

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  id: string; // Ex: "hearts_7_0", "joker_1"
  suit: Suit | 'joker';
  rank: number; // 1(As) - 13(Roi), 0 pour joker
  deckIndex: number; // 0 ou 1 (quel jeu de cartes)
}

// --- Combinaisons ---

export type MeldType = 'set' | 'run';

export interface Meld {
  id: string;
  type: MeldType;
  cards: Card[];
}

// --- Phases de tour ---

export enum TurnPhase {
  DRAW = 'DRAW', // Le joueur doit piocher
  PLAY = 'PLAY', // Le joueur peut poser/ajouter/échanger
  DISCARD = 'DISCARD', // Le joueur doit défausser (auto si déjà en PLAY et veut finir)
}

// --- État du joueur ---

export interface RummyPlayerState {
  playerId: string;
  username: string;
  hand: Card[]; // Visible uniquement par le joueur lui-même
  handCount: number; // Visible par tous
  score: number; // Score cumulé sur les manches
  hasInitialMeld: boolean; // A fait sa première pose ?
  isConnected: boolean;
  disconnectedAt?: string; // Timestamp de déconnexion (1 min de grâce)
}

// --- État complet de la partie (côté serveur) ---

export interface RummyGameState {
  gameId: string;
  players: RummyPlayerState[];
  deck: Card[]; // Pioche (face cachée)
  deckCount: number;
  discardPile: Card[]; // Défausse
  melds: Meld[]; // Combinaisons posées sur la table
  currentPlayerIndex: number;
  currentRound: number;
  totalRounds: number;
  phase: TurnPhase;
  turnStartedAt: string;
  turnTimeLimit: number; // Secondes (défaut: 60)
  roundScores: RoundScore[][];
  isRummySecPossible: boolean; // Aucun joueur n'a encore posé
}

// --- Vue client (ce que chaque joueur reçoit) ---

export interface RummyClientState {
  gameId: string;
  myHand: Card[]; // Mes cartes
  players: RummyClientPlayer[]; // Les autres joueurs (sans leurs cartes)
  deckCount: number; // Nombre de cartes dans la pioche
  discardTop: Card | null; // Carte du dessus de la défausse
  melds: Meld[]; // Combinaisons sur la table
  currentPlayerIndex: number;
  currentPlayerId: string;
  phase: TurnPhase;
  currentRound: number;
  totalRounds: number;
  turnStartedAt: string;
  turnTimeLimit: number;
  myIndex: number; // Mon index dans la liste players
  hasInitialMeld: boolean; // Est-ce que j'ai fait ma première pose ?
  isRummySecPossible: boolean;
}

export interface RummyClientPlayer {
  playerId: string;
  username: string;
  avatarUrl?: string;
  handCount: number;
  score: number;
  hasInitialMeld: boolean;
  isConnected: boolean;
  seatPosition: number;
}

// --- Scores ---

export interface RoundScore {
  playerId: string;
  username: string;
  points: number;
  isWinner: boolean;
  isRummySec: boolean;
  cardsLeft: Card[]; // Cartes restantes en main (pour l'affichage fin de manche)
}

// --- Règles spéciales ---

export interface RummySpecialRules {
  initialMeldThreshold: number; // 30 (défaut) ou 40
  noInitialMeld: boolean; // Pas de première pose requise
  cyclicSequences: boolean; // As au milieu autorisé
  noJokers: boolean; // Jokers retirés
  strictJokers: boolean; // Jokers stricts
  strictSets: boolean; // Séries strictes (ordre des couleurs)
  knockRule: boolean; // Frappe
  winWithoutDiscard: boolean; // Victoire sans défausse
  casinoScoring: boolean; // Scores de casino
}

export const DEFAULT_RUMMY_RULES: RummySpecialRules = {
  initialMeldThreshold: 30,
  noInitialMeld: false,
  cyclicSequences: false,
  noJokers: false,
  strictJokers: false,
  strictSets: false,
  knockRule: false,
  winWithoutDiscard: false,
  casinoScoring: false,
};

// --- Constantes ---

export const RUMMY_CONSTANTS = {
  CARDS_PER_PLAYER: 13,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
  DEFAULT_ROUNDS: 3,
  DEFAULT_TURN_TIME: 60, // secondes
  RECONNECT_GRACE_PERIOD: 60, // 1 minute
  MIN_MELD_SIZE: 3,
  JOKER_COUNT: 6,
  JOKER_PENALTY_POINTS: 20,
  ACE_HIGH_POINTS: 11,
  ACE_LOW_POINTS: 1,
  FACE_CARD_POINTS: 10,
} as const;
