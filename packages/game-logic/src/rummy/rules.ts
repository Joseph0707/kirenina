// ============================================
// Rules — Validation des combinaisons du Rami
// ============================================

import type { Card, Meld, MeldType, Suit, RummySpecialRules } from '@kirenina/shared-types';

/**
 * Vérifie si un ensemble de cartes forme une combinaison valide.
 * Retourne le type de combinaison si valide, null sinon.
 */
export function validateMeld(
  cards: Card[],
  rules: RummySpecialRules,
): { valid: boolean; type: MeldType | null; error?: string } {
  if (cards.length < 3) {
    return { valid: false, type: null, error: 'Une combinaison doit contenir au moins 3 cartes' };
  }

  // Séparer jokers et cartes naturelles
  const naturalCards = cards.filter((c) => c.suit !== 'joker');
  const jokerCount = cards.length - naturalCards.length;

  // Règle : pas plus de jokers que de cartes naturelles
  if (jokerCount > naturalCards.length) {
    return {
      valid: false,
      type: null,
      error: 'Il ne peut pas y avoir plus de jokers que de cartes naturelles',
    };
  }

  // Jokers stricts : pas de 2 jokers consécutifs
  if (rules.strictJokers && jokerCount >= 2) {
    // Vérifier qu'il n'y a pas 2 jokers consécutifs
    let consecutiveJokers = 0;
    for (const card of cards) {
      if (card.suit === 'joker') {
        consecutiveJokers++;
        if (consecutiveJokers >= 2) {
          return {
            valid: false,
            type: null,
            error: 'Deux jokers consécutifs ne sont pas autorisés (jokers stricts)',
          };
        }
      } else {
        consecutiveJokers = 0;
      }
    }
  }

  // Essayer de valider comme série (set)
  const setResult = validateSet(naturalCards, jokerCount, rules);
  if (setResult.valid) return { valid: true, type: 'set' };

  // Essayer de valider comme suite (run)
  const runResult = validateRun(cards, naturalCards, jokerCount, rules);
  if (runResult.valid) return { valid: true, type: 'run' };

  return {
    valid: false,
    type: null,
    error: setResult.error || runResult.error || 'Combinaison invalide',
  };
}

/**
 * Valide une série (set) : 3-4 cartes de même rang, couleurs différentes.
 */
function validateSet(
  naturalCards: Card[],
  jokerCount: number,
  rules: RummySpecialRules,
): { valid: boolean; error?: string } {
  const totalCards = naturalCards.length + jokerCount;

  // Une série fait 3 ou 4 cartes max
  if (totalCards < 3 || totalCards > 4) {
    return { valid: false, error: 'Une série doit contenir 3 ou 4 cartes' };
  }

  // Toutes les cartes naturelles doivent avoir le même rang
  if (naturalCards.length > 0) {
    const rank = naturalCards[0].rank;
    if (!naturalCards.every((c) => c.rank === rank)) {
      return { valid: false, error: 'Toutes les cartes d\'une série doivent avoir le même rang' };
    }
  }

  // Chaque couleur ne peut apparaître qu'une fois
  const suits = naturalCards.map((c) => c.suit);
  const uniqueSuits = new Set(suits);
  if (uniqueSuits.size !== suits.length) {
    return {
      valid: false,
      error: 'Chaque couleur ne peut apparaître qu\'une fois dans une série',
    };
  }

  // Séries strictes : vérifier l'ordre des couleurs
  if (rules.strictSets && naturalCards.length > 1) {
    const suitOrder: Suit[] = ['clubs', 'spades', 'hearts', 'diamonds'];
    const suitIndices = naturalCards.map((c) => suitOrder.indexOf(c.suit as Suit));
    // Les indices doivent être consécutifs dans l'ordre
    suitIndices.sort((a, b) => a - b);
    for (let i = 1; i < suitIndices.length; i++) {
      if (suitIndices[i] !== suitIndices[i - 1] + 1) {
        // Vérifier si un joker peut combler le trou
        // Pour simplifier, on vérifie juste que l'écart total <= cartes + jokers
        const gaps = suitIndices[suitIndices.length - 1] - suitIndices[0] + 1;
        if (gaps > totalCards) {
          return {
            valid: false,
            error: 'Séries strictes : les couleurs doivent se suivre (trèfle, pique, cœur, carreau)',
          };
        }
      }
    }
  }

  // Jokers stricts : pour remplacer un joker dans une série,
  // la série doit être complète (4 cartes)
  if (rules.strictJokers && jokerCount > 0 && totalCards < 4) {
    // Cette règle s'applique au remplacement, pas à la pose initiale
    // On la vérifie dans la logique de swap
  }

  return { valid: true };
}

/**
 * Valide une suite (run) : 3+ cartes consécutives de même couleur.
 */
function validateRun(
  allCards: Card[],
  naturalCards: Card[],
  jokerCount: number,
  rules: RummySpecialRules,
): { valid: boolean; error?: string } {
  if (allCards.length > 13) {
    return { valid: false, error: 'Une suite ne peut pas dépasser 13 cartes' };
  }

  if (naturalCards.length === 0) {
    return { valid: false, error: 'Une suite doit contenir au moins une carte naturelle' };
  }

  // Toutes les cartes naturelles doivent être de la même couleur
  const suit = naturalCards[0].suit;
  if (!naturalCards.every((c) => c.suit === suit)) {
    return { valid: false, error: 'Toutes les cartes d\'une suite doivent être de la même couleur' };
  }

  // Trier par rang
  const sortedRanks = naturalCards.map((c) => c.rank).sort((a, b) => a - b);

  // Vérifier les doublons de rang (pas possible dans une suite)
  for (let i = 1; i < sortedRanks.length; i++) {
    if (sortedRanks[i] === sortedRanks[i - 1]) {
      return { valid: false, error: 'Une suite ne peut pas contenir deux cartes du même rang' };
    }
  }

  // Calculer les trous entre les rangs
  let jokersNeeded = 0;

  // Cas spécial : l'As peut être bas (1) ou haut (14)
  // Essayer les deux cas si un As est présent
  const hasAce = sortedRanks.includes(1);

  if (hasAce) {
    // Essayer As bas (1, 2, 3, ...)
    const lowResult = checkRunGaps(sortedRanks, jokerCount, false, rules);
    // Essayer As haut (..., 12, 13, 14)
    const highRanks = sortedRanks.map((r) => (r === 1 ? 14 : r)).sort((a, b) => a - b);
    const highResult = checkRunGaps(highRanks, jokerCount, true, rules);

    if (!lowResult.valid && !highResult.valid) {
      return { valid: false, error: lowResult.error || 'Suite invalide' };
    }
    return { valid: true };
  }

  // Pas d'As : vérification simple
  const result = checkRunGaps(sortedRanks, jokerCount, false, rules);
  if (!result.valid) {
    return { valid: false, error: result.error };
  }

  return { valid: true };
}

/**
 * Vérifie les trous dans une suite et si les jokers peuvent les combler.
 */
function checkRunGaps(
  sortedRanks: number[],
  jokerCount: number,
  _isAceHigh: boolean,
  rules: RummySpecialRules,
): { valid: boolean; error?: string } {
  let jokersNeeded = 0;

  for (let i = 1; i < sortedRanks.length; i++) {
    const gap = sortedRanks[i] - sortedRanks[i - 1] - 1;
    if (gap < 0) {
      return { valid: false, error: 'Rangs invalides dans la suite' };
    }
    jokersNeeded += gap;
  }

  if (jokersNeeded > jokerCount) {
    return {
      valid: false,
      error: `Il manque ${jokersNeeded - jokerCount} carte(s) pour compléter la suite`,
    };
  }

  // Vérifier que la suite ne dépasse pas les bornes (2-14 ou 1-13)
  const minRank = sortedRanks[0];
  const maxRank = sortedRanks[sortedRanks.length - 1];
  const totalLength = maxRank - minRank + 1;

  if (totalLength > 13) {
    return { valid: false, error: 'Une suite ne peut pas dépasser 13 cartes' };
  }

  // Séquences cycliques : l'As peut être au milieu
  if (!rules.cyclicSequences) {
    // L'As ne peut être qu'au début (1) ou à la fin (14)
    // Vérifié par le fait qu'on teste les 2 cas séparément
  }

  return { valid: true };
}

/**
 * Vérifie si une carte peut être ajoutée à une combinaison existante.
 */
export function canAddToMeld(meld: Meld, card: Card, rules: RummySpecialRules): boolean {
  const newCards = [...meld.cards, card];
  const result = validateMeld(newCards, rules);
  return result.valid;
}

/**
 * Vérifie si un joker dans une combinaison peut être remplacé par une carte.
 */
export function canSwapJoker(
  meld: Meld,
  jokerCardId: string,
  replacementCard: Card,
  rules: RummySpecialRules,
): boolean {
  const jokerIndex = meld.cards.findIndex((c) => c.id === jokerCardId);
  if (jokerIndex === -1) return false;
  if (meld.cards[jokerIndex].suit !== 'joker') return false;

  // Jokers stricts : pour une série, elle doit être complète (4 cartes)
  if (rules.strictJokers && meld.type === 'set' && meld.cards.length < 4) {
    return false;
  }

  // Remplacer le joker par la carte et vérifier
  const newCards = [...meld.cards];
  newCards[jokerIndex] = replacementCard;
  const result = validateMeld(newCards, rules);
  return result.valid;
}
