import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdatePlayerInput } from '@kirenina/utils';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new NotFoundException('Joueur introuvable');
    }

    // Calculer le winRate dynamiquement
    const winRate = player.gamesPlayed > 0 
      ? Math.round((player.gamesWon / player.gamesPlayed) * 100) 
      : 0;

    return {
      ...player,
      winRate,
    };
  }

  async updateProfile(playerId: string, data: UpdatePlayerInput) {
    // Si on veut changer de pseudo, vérifier qu'il n'est pas pris
    if (data.username) {
      const existing = await this.prisma.player.findFirst({
        where: { 
          username: data.username,
          id: { not: playerId }
        },
      });

      if (existing) {
        throw new BadRequestException('Ce nom de joueur est déjà pris');
      }
    }

    const updated = await this.prisma.player.update({
      where: { id: playerId },
      data,
    });

    return updated;
  }

  async getLeaderboard(limit: number = 10) {
    const players = await this.prisma.player.findMany({
      where: { isPublic: true },
      orderBy: [
        { totalPoints: 'desc' },
        { gamesWon: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        totalPoints: true,
        gamesWon: true,
        medal: true,
      },
    });

    return players.map((p, index) => ({
      rank: index + 1,
      playerId: p.id,
      username: p.username,
      avatarUrl: p.avatarUrl,
      totalPoints: p.totalPoints,
      gamesWon: p.gamesWon,
      medal: p.medal,
    }));
  }

  async getPublicProfile(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player || !player.isPublic) {
      throw new NotFoundException('Joueur introuvable ou profil privé');
    }

    const winRate = player.gamesPlayed > 0 
      ? Math.round((player.gamesWon / player.gamesPlayed) * 100) 
      : 0;

    return {
      id: player.id,
      username: player.username,
      avatarUrl: player.avatarUrl,
      totalPoints: player.totalPoints,
      gamesPlayed: player.gamesPlayed,
      gamesWon: player.gamesWon,
      medal: player.medal,
      winRate,
      createdAt: player.createdAt,
    };
  }
}
