// ============================================
// State Machine — Gestion de l'état du Rami
// ============================================

import type {
  Card,
  Meld,
  RummyGameState,
  RummyPlayerState,
  RummyClientState,
  RummyClientPlayer,
  RummySpecialRules,
  RoundScore,
} from '@kirenina/shared-types';
import { TurnPhase } from '@kirenina/shared-types';
import { createDeck, shuffleDeck, dealCards } from './deck';
import { calculateRoundScores } from './scoring';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initialise une nouvelle partie de Rami.
 */
export function initializeGame(
  gameId: string,
  playerIds: { playerId: string; username: string }[],
  totalRounds: number = 3,
  rules: RummySpecialRules,
): RummyGameState {
  const deck = shuffleDeck(createDeck(rules.noJokers));
  const { hands, remainingDeck } = dealCards(deck, playerIds.length, 13);

  // Retourner la première carte de la pioche pour la défausse
  const firstDiscard = remainingDeck.shift()!;

  const players: RummyPlayerState[] = playerIds.map((p, index) => ({
    playerId: p.playerId,
    username: p.username,
    hand: hands[index],
    handCount: hands[index].length,
    score: 0,
    hasInitialMeld: rules.noInitialMeld, // Si pas de première pose requise, déjà "fait"
    isConnected: true,
  }));

  // Premier joueur choisi au hasard
  const firstPlayerIndex = Math.floor(Math.random() * playerIds.length);

  return {
    gameId,
    players,
    deck: remainingDeck,
    deckCount: remainingDeck.length,
    discardPile: [firstDiscard],
    melds: [],
    currentPlayerIndex: firstPlayerIndex,
    currentRound: 1,
    totalRounds,
    phase: TurnPhase.DRAW,
    turnStartedAt: new Date().toISOString(),
    turnTimeLimit: 60,
    roundScores: [],
    isRummySecPossible: true, // Vrai tant qu'aucun joueur n'a posé
  };
}

/**
 * Initialise une nouvelle manche (garde les scores).
 */
export function initializeNewRound(
  state: RummyGameState,
  rules: RummySpecialRules,
): RummyGameState {
  const deck = shuffleDeck(createDeck(rules.noJokers));
  const { hands, remainingDeck } = dealCards(deck, state.players.length, 13);
  const firstDiscard = remainingDeck.shift()!;

  const players: RummyPlayerState[] = state.players.map((p, index) => ({
    ...p,
    hand: hands[index],
    handCount: hands[index].length,
    hasInitialMeld: rules.noInitialMeld,
  }));

  const firstPlayerIndex = Math.floor(Math.random() * state.players.length);

  return {
    ...state,
    players,
    deck: remainingDeck,
    deckCount: remainingDeck.length,
    discardPile: [firstDiscard],
    melds: [],
    currentPlayerIndex: firstPlayerIndex,
    currentRound: state.currentRound + 1,
    phase: TurnPhase.DRAW,
    turnStartedAt: new Date().toISOString(),
    isRummySecPossible: true,
  };
}

/**
 * Exécute une pioche.
 */
export function executeDraw(
  state: RummyGameState,
  source: 'deck' | 'discard',
): { state: RummyGameState; drawnCard: Card } {
  const newState = { ...state, players: state.players.map((p) => ({ ...p, hand: [...p.hand] })) };
  const player = newState.players[newState.currentPlayerIndex];

  let drawnCard: Card;

  if (source === 'deck') {
    drawnCard = newState.deck.shift()!;
    newState.deckCount = newState.deck.length;
  } else {
    drawnCard = newState.discardPile.pop()!;
  }

  player.hand.push(drawnCard);
  player.handCount = player.hand.length;
  newState.phase = TurnPhase.PLAY;

  return { state: newState, drawnCard };
}

/**
 * Exécute la pose d'une combinaison.
 */
export function executeMeld(
  state: RummyGameState,
  cards: Card[],
  meldType: 'set' | 'run',
): { state: RummyGameState; meld: Meld } {
  const newState = { ...state, players: state.players.map((p) => ({ ...p, hand: [...p.hand] })) };
  const player = newState.players[newState.currentPlayerIndex];

  // Retirer les cartes de la main
  for (const card of cards) {
    const index = player.hand.findIndex((h) => h.id === card.id);
    if (index !== -1) {
      player.hand.splice(index, 1);
    }
  }
  player.handCount = player.hand.length;

  // Créer la combinaison
  const meld: Meld = {
    id: uuidv4(),
    type: meldType,
    cards: [...cards],
  };

  newState.melds = [...newState.melds, meld];

  // Marquer que le joueur a posé (première pose)
  if (!player.hasInitialMeld) {
    player.hasInitialMeld = true;
  }

  // Si un joueur a posé, le rami sec n'est plus possible pour les autres
  // (sauf si c'est le même joueur qui pose tout au même tour)
  if (newState.isRummySecPossible) {
    // Le rami sec reste possible seulement si c'est le premier joueur à poser
    // et qu'aucun autre n'a encore posé dans les tours précédents
    const otherPlayersPosted = newState.players.some(
      (p, i) => i !== newState.currentPlayerIndex && p.hasInitialMeld && !state.players[i].hasInitialMeld === false,
    );
    // Simplifié : le rami sec est possible si aucun joueur n'avait de première pose avant ce tour
    const anyPreviousMelds = state.melds.length > 0;
    if (anyPreviousMelds) {
      newState.isRummySecPossible = false;
    }
  }

  return { state: newState, meld };
}

/**
 * Exécute l'ajout d'une carte à une combinaison existante.
 */
export function executeAddToMeld(
  state: RummyGameState,
  meldId: string,
  card: Card,
): { state: RummyGameState; updatedMeld: Meld } {
  const newState = { ...state, players: state.players.map((p) => ({ ...p, hand: [...p.hand] })) };
  const player = newState.players[newState.currentPlayerIndex];

  // Retirer la carte de la main
  const cardIndex = player.hand.findIndex((h) => h.id === card.id);
  if (cardIndex !== -1) {
    player.hand.splice(cardIndex, 1);
  }
  player.handCount = player.hand.length;

  // Ajouter à la combinaison
  newState.melds = newState.melds.map((m) => {
    if (m.id === meldId) {
      return { ...m, cards: [...m.cards, card] };
    }
    return m;
  });

  const updatedMeld = newState.melds.find((m) => m.id === meldId)!;
  return { state: newState, updatedMeld };
}

/**
 * Exécute le remplacement d'un joker.
 */
export function executeSwapJoker(
  state: RummyGameState,
  meldId: string,
  jokerCardId: string,
  replacementCard: Card,
): { state: RummyGameState; updatedMeld: Meld; jokerCard: Card } {
  const newState = { ...state, players: state.players.map((p) => ({ ...p, hand: [...p.hand] })) };
  const player = newState.players[newState.currentPlayerIndex];

  // Retirer la carte de remplacement de la main
  const cardIndex = player.hand.findIndex((h) => h.id === replacementCard.id);
  if (cardIndex !== -1) {
    player.hand.splice(cardIndex, 1);
  }

  // Trouver le joker dans la combinaison
  let jokerCard: Card | null = null;
  newState.melds = newState.melds.map((m) => {
    if (m.id === meldId) {
      const newCards = m.cards.map((c) => {
        if (c.id === jokerCardId) {
          jokerCard = c;
          return replacementCard;
        }
        return c;
      });
      return { ...m, cards: newCards };
    }
    return m;
  });

  // Ajouter le joker à la main
  if (jokerCard) {
    player.hand.push(jokerCard);
  }
  player.handCount = player.hand.length;

  const updatedMeld = newState.melds.find((m) => m.id === meldId)!;
  return { state: newState, updatedMeld, jokerCard: jokerCard! };
}

/**
 * Exécute la défausse d'une carte.
 */
export function executeDiscard(
  state: RummyGameState,
  card: Card,
): RummyGameState {
  const newState = { ...state, players: state.players.map((p) => ({ ...p, hand: [...p.hand] })) };
  const player = newState.players[newState.currentPlayerIndex];

  // Retirer la carte de la main
  const cardIndex = player.hand.findIndex((h) => h.id === card.id);
  if (cardIndex !== -1) {
    player.hand.splice(cardIndex, 1);
  }
  player.handCount = player.hand.length;

  // Ajouter à la défausse
  newState.discardPile = [...newState.discardPile, card];

  // Passer au joueur suivant
  newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;

  // Chercher le prochain joueur connecté
  let attempts = 0;
  while (!newState.players[newState.currentPlayerIndex].isConnected && attempts < newState.players.length) {
    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
    attempts++;
  }

  newState.phase = TurnPhase.DRAW;
  newState.turnStartedAt = new Date().toISOString();

  return newState;
}

/**
 * Convertit l'état serveur en état client (pour un joueur spécifique).
 * Cache les cartes des autres joueurs.
 */
export function toClientState(
  state: RummyGameState,
  playerId: string,
): RummyClientState {
  const myIndex = state.players.findIndex((p) => p.playerId === playerId);
  const myPlayer = state.players[myIndex];

  const players: RummyClientPlayer[] = state.players.map((p, index) => ({
    playerId: p.playerId,
    username: p.username,
    handCount: p.hand.length,
    score: p.score,
    hasInitialMeld: p.hasInitialMeld,
    isConnected: p.isConnected,
    seatPosition: index,
  }));

  return {
    gameId: state.gameId,
    myHand: myPlayer ? [...myPlayer.hand] : [],
    players,
    deckCount: state.deck.length,
    discardTop: state.discardPile.length > 0 ? state.discardPile[state.discardPile.length - 1] : null,
    melds: state.melds,
    currentPlayerIndex: state.currentPlayerIndex,
    currentPlayerId: state.players[state.currentPlayerIndex].playerId,
    phase: state.phase,
    currentRound: state.currentRound,
    totalRounds: state.totalRounds,
    turnStartedAt: state.turnStartedAt,
    turnTimeLimit: state.turnTimeLimit,
    myIndex,
    hasInitialMeld: myPlayer?.hasInitialMeld ?? false,
    isRummySecPossible: state.isRummySecPossible,
  };
}
