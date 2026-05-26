// ============================================
// Scoring — Calcul des scores du Rami
// ============================================

import type { Card, RummyPlayerState, RoundScore, RummySpecialRules } from '@kirenina/shared-types';
import { getCardPenaltyValue } from './deck';

/**
 * Calcule les scores d'une manche terminée.
 *
 * - Le gagnant reçoit la somme des points perdus par les autres joueurs.
 * - Les perdants perdent la valeur des cartes restantes en main.
 * - En cas de rami sec, les scores sont doublés.
 * - Si la pioche est vide (pas de gagnant), tous perdent des points.
 */
export function calculateRoundScores(
  players: RummyPlayerState[],
  winnerId: string | null,
  isRummySec: boolean,
  rules: RummySpecialRules,
): RoundScore[] {
  const scores: RoundScore[] = [];
  const multiplier = isRummySec ? 2 : 1;

  if (winnerId === null) {
    // Pioche vide : tout le monde perd
    for (const player of players) {
      const penaltyPoints = calculateHandPenalty(player.hand);
      scores.push({
        playerId: player.playerId,
        username: player.username,
        points: -penaltyPoints * multiplier,
        isWinner: false,
        isRummySec: false,
        cardsLeft: [...player.hand],
      });
    }
    return scores;
  }

  // Calculer les pénalités des perdants
  let totalPenalty = 0;

  for (const player of players) {
    if (player.playerId === winnerId) continue;

    const penaltyPoints = calculateHandPenalty(player.hand);
    totalPenalty += penaltyPoints;

    scores.push({
      playerId: player.playerId,
      username: player.username,
      points: -penaltyPoints * multiplier,
      isWinner: false,
      isRummySec,
      cardsLeft: [...player.hand],
    });
  }

  // Le gagnant reçoit la somme des pénalités
  const winner = players.find((p) => p.playerId === winnerId)!;
  scores.push({
    playerId: winner.playerId,
    username: winner.username,
    points: totalPenalty * multiplier,
    isWinner: true,
    isRummySec,
    cardsLeft: [],
  });

  return scores;
}

/**
 * Calcule la pénalité totale d'une main (somme des valeurs des cartes).
 */
export function calculateHandPenalty(hand: Card[]): number {
  return hand.reduce((total, card) => total + getCardPenaltyValue(card), 0);
}

/**
 * Calcule les scores finaux d'une partie (somme de toutes les manches).
 */
export function calculateFinalScores(
  allRoundScores: RoundScore[][],
): { playerId: string; username: string; totalPoints: number; roundsWon: number }[] {
  const playerScores = new Map<
    string,
    { username: string; totalPoints: number; roundsWon: number }
  >();

  for (const roundScores of allRoundScores) {
    for (const score of roundScores) {
      const existing = playerScores.get(score.playerId) || {
        username: score.username,
        totalPoints: 0,
        roundsWon: 0,
      };

      existing.totalPoints += score.points;
      if (score.isWinner) existing.roundsWon++;

      playerScores.set(score.playerId, existing);
    }
  }

  return Array.from(playerScores.entries())
    .map(([playerId, data]) => ({
      playerId,
      ...data,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

/**
 * Calcule la valeur totale d'un ensemble de cartes (pour la première pose).
 */
export function calculateMeldValue(cards: Card[]): number {
  let value = 0;

  // Détecter si c'est une suite avec un As
  const naturalCards = cards.filter((c) => c.suit !== 'joker');
  const hasAce = naturalCards.some((c) => c.rank === 1);

  if (hasAce && naturalCards.length >= 2) {
    const ranks = naturalCards.map((c) => c.rank).sort((a, b) => a - b);
    // Si l'As est suivi de 2, 3... → As bas (1 point)
    // Si l'As est précédé de R, D... → As haut (11 points)
    const isAceLow = ranks.includes(2) || ranks.includes(3);

    for (const card of cards) {
      if (card.suit === 'joker') continue; // Joker prend la valeur contextuelle
      if (card.rank === 1) {
        value += isAceLow ? 1 : 11;
      } else if (card.rank >= 10) {
        value += 10;
      } else {
        value += card.rank;
      }
    }
  } else {
    for (const card of cards) {
      if (card.suit === 'joker') continue;
      value += getCardPenaltyValue(card);
    }
  }

  // Ajouter la valeur des jokers (valeur de la carte remplacée)
  // Pour simplifier, on ne compte pas les jokers dans la valeur de la première pose
  // car ils remplacent une carte spécifique
  const jokerCount = cards.length - naturalCards.length;
  // On estime la valeur des jokers en fonction du contexte
  // Pour la première pose, on prend la valeur moyenne des cartes adjacentes

  return value;
}

/**
 * Vérifie si une première pose est valide (>= seuil de points).
 */
export function isValidInitialMeld(
  melds: Card[][],
  rules: RummySpecialRules,
): { valid: boolean; totalValue: number; threshold: number } {
  if (rules.noInitialMeld) {
    return { valid: true, totalValue: 0, threshold: 0 };
  }

  const threshold = rules.initialMeldThreshold;
  let totalValue = 0;

  for (const meldCards of melds) {
    totalValue += calculateMeldValue(meldCards);
  }

  return {
    valid: totalValue >= threshold,
    totalValue,
    threshold,
  };
}
