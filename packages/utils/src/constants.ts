// ============================================
// Constants — Constantes globales de l'application
// ============================================

/** Nom de l'application */
export const APP_NAME = 'Kirenina';

/** Version de l'application */
export const APP_VERSION = '0.1.0';

/** Durée de grâce pour la reconnexion (en secondes) */
export const RECONNECT_GRACE_PERIOD = 60;

/** Longueur du code de room privée */
export const ROOM_CODE_LENGTH = 6;

/** Nombre max de messages chat conservés par room */
export const MAX_CHAT_MESSAGES = 100;

/** Durée du countdown avant le début de partie (en secondes) */
export const GAME_START_COUNTDOWN = 5;

/** Pagination par défaut */
export const DEFAULT_PAGE_SIZE = 20;

/** Nombre de joueurs dans le leaderboard de la page d'accueil */
export const LEADERBOARD_HOME_SIZE = 10;

/** Points de classement minimum pour les médailles */
export const MEDAL_THRESHOLDS = {
  GOLD: 1, // 1er
  SILVER: 2, // 2ème
  BRONZE: 3, // 3ème
} as const;

/** Couleurs des couleurs de cartes (pour le rendu) */
export const SUIT_COLORS = {
  hearts: '#E53E3E',
  diamonds: '#E53E3E',
  clubs: '#1A202C',
  spades: '#1A202C',
  joker: '#805AD5',
} as const;

/** Symboles Unicode des couleurs de cartes */
export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
  joker: '🃏',
} as const;
