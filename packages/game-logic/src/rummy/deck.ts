// ============================================
// Deck — Création et mélange du jeu de cartes
// ============================================

import type { Card, Suit } from '@kirenina/shared-types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // 1=As, 11=V, 12=D, 13=R

/**
 * Crée un jeu complet de 110 cartes (2×52 + 6 jokers).
 * Si noJokers est true, crée seulement 104 cartes (2×52).
 */
export function createDeck(noJokers: boolean = false): Card[] {
  const cards: Card[] = [];

  // 2 jeux de 52 cartes
  for (let deckIndex = 0; deckIndex < 2; deckIndex++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({
          id: `${suit}_${rank}_${deckIndex}`,
          suit,
          rank,
          deckIndex,
        });
      }
    }
  }

  // 6 jokers (3 par jeu)
  if (!noJokers) {
    for (let i = 0; i < 6; i++) {
      cards.push({
        id: `joker_${i}`,
        suit: 'joker',
        rank: 0,
        deckIndex: i < 3 ? 0 : 1,
      });
    }
  }

  return cards;
}

/**
 * Mélange un tableau de cartes en place (Fisher-Yates shuffle).
 * Retourne le tableau pour chaîner.
 */
export function shuffleDeck(cards: Card[]): Card[] {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

/**
 * Distribue les cartes aux joueurs.
 * Retourne un objet avec les mains des joueurs et le deck restant.
 */
export function dealCards(
  deck: Card[],
  playerCount: number,
  cardsPerPlayer: number = 13,
): { hands: Card[][]; remainingDeck: Card[] } {
  const hands: Card[][] = [];
  const deckCopy = [...deck];

  for (let p = 0; p < playerCount; p++) {
    const hand: Card[] = [];
    for (let c = 0; c < cardsPerPlayer; c++) {
      const card = deckCopy.shift();
      if (!card) {
        throw new Error('Pas assez de cartes dans le deck pour distribuer');
      }
      hand.push(card);
    }
    hands.push(hand);
  }

  return { hands, remainingDeck: deckCopy };
}

/**
 * Retourne le nom lisible d'une carte.
 */
export function getCardName(card: Card): string {
  if (card.suit === 'joker') return 'Joker';

  const suitNames: Record<Suit, string> = {
    hearts: 'Cœur',
    diamonds: 'Carreau',
    clubs: 'Trèfle',
    spades: 'Pique',
  };

  const rankNames: Record<number, string> = {
    1: 'As',
    11: 'Valet',
    12: 'Dame',
    13: 'Roi',
  };

  const rankName = rankNames[card.rank] || card.rank.toString();
  return `${rankName} de ${suitNames[card.suit as Suit]}`;
}

/**
 * Retourne la valeur en points d'une carte en main (fin de manche).
 */
export function getCardPenaltyValue(card: Card): number {
  if (card.suit === 'joker') return 20;
  if (card.rank === 1) return 11; // As = 11 en main
  if (card.rank >= 10) return 10; // 10, V, D, R = 10
  return card.rank; // 2-9 = valeur faciale
}

/**
 * Retourne la valeur d'une carte dans une combinaison.
 * Pour l'As, la valeur dépend du contexte (1 si bas, 11 si haut).
 */
export function getCardMeldValue(card: Card, asHigh: boolean = false): number {
  if (card.suit === 'joker') return 0; // Valeur contextuelle
  if (card.rank === 1) return asHigh ? 11 : 1;
  if (card.rank >= 10) return 10;
  return card.rank;
}
