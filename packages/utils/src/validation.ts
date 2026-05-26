// ============================================
// Validation — Schémas Zod partagés
// ============================================

import { z } from 'zod';

// --- Joueur ---

export const createPlayerSchema = z.object({
  deviceId: z.string().min(10, 'Device ID invalide'),
  username: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(20, 'Le nom ne peut pas dépasser 20 caractères')
    .regex(
      /^[a-zA-Z0-9_àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]+$/,
      'Le nom ne peut contenir que des lettres, chiffres et underscores',
    ),
});

export const updatePlayerSchema = z.object({
  username: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(20, 'Le nom ne peut pas dépasser 20 caractères')
    .regex(
      /^[a-zA-Z0-9_àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]+$/,
      'Le nom ne peut contenir que des lettres, chiffres et underscores',
    )
    .optional(),
  avatarUrl: z.string().url('URL invalide').optional(),
  isPublic: z.boolean().optional(),
});

// --- Room ---

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom de la room doit contenir au moins 3 caractères')
    .max(30, 'Le nom de la room ne peut pas dépasser 30 caractères'),
  isPublic: z.boolean(),
  gameType: z.enum(['RUMMY']),
  maxPlayers: z.number().int().min(2).max(4),
  totalRounds: z.number().int().min(1).max(10).optional().default(3),
  allowSpectators: z.boolean().optional().default(true),
});

// --- Chat ---

export const chatMessageSchema = z.object({
  roomId: z.string().uuid('ID de room invalide'),
  message: z
    .string()
    .min(1, 'Le message ne peut pas être vide')
    .max(200, 'Le message ne peut pas dépasser 200 caractères'),
});

// --- Règles spéciales Rami ---

export const rummySpecialRulesSchema = z.object({
  initialMeldThreshold: z.number().int().min(0).max(100).optional().default(30),
  noInitialMeld: z.boolean().optional().default(false),
  cyclicSequences: z.boolean().optional().default(false),
  noJokers: z.boolean().optional().default(false),
  strictJokers: z.boolean().optional().default(false),
  strictSets: z.boolean().optional().default(false),
  knockRule: z.boolean().optional().default(false),
  winWithoutDiscard: z.boolean().optional().default(false),
  casinoScoring: z.boolean().optional().default(false),
});

// --- Types inférés ---

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type RummySpecialRulesInput = z.infer<typeof rummySpecialRulesSchema>;

// --- Helpers ---

/**
 * Génère un code de room aléatoire (6 caractères alphanumériques majuscules).
 */
export function generateRoomCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour éviter confusion
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
