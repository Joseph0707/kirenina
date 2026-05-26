import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { rummy } from '@kirenina/game-logic';
import { GameStatus } from '@prisma/client';
import { RummyGameState, RummySpecialRules } from '@kirenina/shared-types';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async createGameFromRoom(roomId: string, rules: RummySpecialRules) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) throw new NotFoundException('Room introuvable');

    throw new Error('À implémenter: init via socket.io gateway');
  }

  async getGameState(gameId: string): Promise<RummyGameState> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) throw new NotFoundException('Game introuvable');

    return game.state as unknown as RummyGameState;
  }

  async saveGameState(gameId: string, state: RummyGameState) {
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        state: state as any,
        currentRound: state.currentRound,
      } as any,
    });
  }
}
