// ============================================
// Validation — Validation des coups de jeu
// ============================================

import type {
  Card,
  Meld,
  RummyGameState,
  RummySpecialRules,
  TurnPhase,
} from '@kirenina/shared-types';
import { TurnPhase as TurnPhaseEnum } from '@kirenina/shared-types';
import { validateMeld, canAddToMeld, canSwapJoker } from './rules';
import { isValidInitialMeld } from './scoring';

/**
 * Vérifie si le joueur peut piocher.
 */
export function canDraw(
  state: RummyGameState,
  playerId: string,
  source: 'deck' | 'discard',
): { valid: boolean; error?: string } {
  if (state.players[state.currentPlayerIndex].playerId !== playerId) {
    return { valid: false, error: "Ce n'est pas votre tour" };
  }

  if (state.phase !== TurnPhaseEnum.DRAW) {
    return { valid: false, error: 'Vous avez déjà pioché ce tour' };
  }

  if (source === 'deck' && state.deck.length === 0) {
    return { valid: false, error: 'La pioche est vide' };
  }

  if (source === 'discard' && state.discardPile.length === 0) {
    return { valid: false, error: 'La défausse est vide' };
  }

  return { valid: true };
}

/**
 * Vérifie si le joueur peut poser une combinaison.
 */
export function canPlayMeld(
  state: RummyGameState,
  playerId: string,
  cards: Card[],
  rules: RummySpecialRules,
): { valid: boolean; error?: string } {
  const playerIndex = state.players.findIndex((p) => p.playerId === playerId);
  if (playerIndex === -1) return { valid: false, error: 'Joueur introuvable' };

  if (state.currentPlayerIndex !== playerIndex) {
    return { valid: false, error: "Ce n'est pas votre tour" };
  }

  if (state.phase === TurnPhaseEnum.DRAW) {
    return { valid: false, error: 'Vous devez d\'abord piocher une carte' };
  }

  const player = state.players[playerIndex];

  // Vérifier que le joueur possède toutes les cartes
  for (const card of cards) {
    if (!player.hand.some((h) => h.id === card.id)) {
      return { valid: false, error: `Vous ne possédez pas la carte ${card.id}` };
    }
  }

  // Valider la combinaison
  const meldResult = validateMeld(cards, rules);
  if (!meldResult.valid) {
    return { valid: false, error: meldResult.error };
  }

  // Si le joueur n'a pas encore fait sa première pose, vérifier le seuil
  if (!player.hasInitialMeld) {
    // Le joueur doit atteindre le seuil avec cette pose (et potentiellement d'autres poses au même tour)
    // On vérifie ici uniquement que la combinaison elle-même est valide
    // La vérification du seuil se fait au moment de la défausse
  }

  return { valid: true };
}

/**
 * Vérifie si le joueur peut ajouter une carte à une combinaison existante.
 */
export function canAddCard(
  state: RummyGameState,
  playerId: string,
  meldId: string,
  card: Card,
  rules: RummySpecialRules,
): { valid: boolean; error?: string } {
  const playerIndex = state.players.findIndex((p) => p.playerId === playerId);
  if (playerIndex === -1) return { valid: false, error: 'Joueur introuvable' };

  if (state.currentPlayerIndex !== playerIndex) {
    return { valid: false, error: "Ce n'est pas votre tour" };
  }

  if (state.phase === TurnPhaseEnum.DRAW) {
    return { valid: false, error: 'Vous devez d\'abord piocher une carte' };
  }

  const player = state.players[playerIndex];

  // Première pose requise
  if (!player.hasInitialMeld) {
    return {
      valid: false,
      error: 'Vous devez d\'abord effectuer votre première pose',
    };
  }

  // Vérifier que le joueur possède la carte
  if (!player.hand.some((h) => h.id === card.id)) {
    return { valid: false, error: 'Vous ne possédez pas cette carte' };
  }

  // Trouver la combinaison
  const meld = state.melds.find((m) => m.id === meldId);
  if (!meld) return { valid: false, error: 'Combinaison introuvable' };

  // Vérifier que l'ajout est valide
  if (!canAddToMeld(meld, card, rules)) {
    return { valid: false, error: 'Cette carte ne peut pas être ajoutée à cette combinaison' };
  }

  return { valid: true };
}

/**
 * Vérifie si le joueur peut remplacer un joker.
 */
export function canSwapJokerAction(
  state: RummyGameState,
  playerId: string,
  meldId: string,
  jokerCardId: string,
  replacementCard: Card,
  rules: RummySpecialRules,
): { valid: boolean; error?: string } {
  const playerIndex = state.players.findIndex((p) => p.playerId === playerId);
  if (playerIndex === -1) return { valid: false, error: 'Joueur introuvable' };

  if (state.currentPlayerIndex !== playerIndex) {
    return { valid: false, error: "Ce n'est pas votre tour" };
  }

  if (state.phase === TurnPhaseEnum.DRAW) {
    return { valid: false, error: 'Vous devez d\'abord piocher une carte' };
  }

  const player = state.players[playerIndex];

  if (!player.hasInitialMeld) {
    return { valid: false, error: 'Vous devez d\'abord effectuer votre première pose' };
  }

  // Vérifier que le joueur possède la carte de remplacement
  if (!player.hand.some((h) => h.id === replacementCard.id)) {
    return { valid: false, error: 'Vous ne possédez pas la carte de remplacement' };
  }

  const meld = state.melds.find((m) => m.id === meldId);
  if (!meld) return { valid: false, error: 'Combinaison introuvable' };

  if (!canSwapJoker(meld, jokerCardId, replacementCard, rules)) {
    return { valid: false, error: 'Échange de joker invalide' };
  }

  return { valid: true };
}

/**
 * Vérifie si le joueur peut défausser une carte.
 */
export function canDiscard(
  state: RummyGameState,
  playerId: string,
  card: Card,
  rules: RummySpecialRules,
): { valid: boolean; error?: string } {
  const playerIndex = state.players.findIndex((p) => p.playerId === playerId);
  if (playerIndex === -1) return { valid: false, error: 'Joueur introuvable' };

  if (state.currentPlayerIndex !== playerIndex) {
    return { valid: false, error: "Ce n'est pas votre tour" };
  }

  if (state.phase === TurnPhaseEnum.DRAW) {
    return { valid: false, error: 'Vous devez d\'abord piocher une carte' };
  }

  const player = state.players[playerIndex];

  if (!player.hand.some((h) => h.id === card.id)) {
    return { valid: false, error: 'Vous ne possédez pas cette carte' };
  }

  // Jokers stricts : pas le droit de défausser un joker
  if (rules.strictJokers && card.suit === 'joker') {
    return { valid: false, error: 'Vous ne pouvez pas défausser un joker (jokers stricts)' };
  }

  return { valid: true };
}

/**
 * Vérifie si la manche est terminée.
 */
export function checkRoundEnd(
  state: RummyGameState,
  rules: RummySpecialRules,
): { ended: boolean; winnerId: string | null; isRummySec: boolean } {
  // Vérifier si un joueur n'a plus de cartes
  for (const player of state.players) {
    if (player.hand.length === 0) {
      const isRummySec = state.isRummySecPossible;
      return { ended: true, winnerId: player.playerId, isRummySec };
    }
  }

  // Pioche vide = fin de manche sans gagnant
  if (state.deck.length === 0) {
    return { ended: true, winnerId: null, isRummySec: false };
  }

  return { ended: false, winnerId: null, isRummySec: false };
}
