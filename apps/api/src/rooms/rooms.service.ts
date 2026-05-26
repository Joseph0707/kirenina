import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoomInput, generateRoomCode } from '@kirenina/utils';
import { GameType, RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(creatorId: string, data: CreateRoomInput) {
    const code = generateRoomCode();

    const room = await this.prisma.room.create({
      data: {
        name: data.name,
        code,
        isPublic: data.isPublic,
        gameType: data.gameType as GameType,
        maxPlayers: data.maxPlayers,
        creatorId,
        status: RoomStatus.WAITING,
      },
      include: {
        creator: {
          select: { id: true, username: true }
        }
      }
    });

    return room;
  }

  async getActiveRooms(limit: number = 20, page: number = 1) {
    const skip = (page - 1) * limit;

    const rooms = await this.prisma.room.findMany({
      where: {
        isPublic: true,
        status: RoomStatus.WAITING,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        creator: { select: { username: true } },
      },
    });

    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      code: room.code,
      gameType: room.gameType,
      maxPlayers: room.maxPlayers,
      status: room.status,
      creatorUsername: room.creator.username,
      createdAt: room.createdAt,
    }));
  }

  async getRoomById(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: { select: { id: true, username: true } },
      },
    });

    if (!room) {
      throw new NotFoundException('Room introuvable');
    }

    return room;
  }

  async getRoomByCode(code: string) {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: {
        creator: { select: { id: true, username: true } },
      },
    });

    if (!room) {
      throw new NotFoundException('Code de room invalide');
    }

    return room;
  }

  async deleteRoom(roomId: string, playerId: string) {
    const room = await this.getRoomById(roomId);

    if (room.creatorId !== playerId) {
      throw new ForbiddenException('Seul le créateur peut supprimer cette room');
    }

    await this.prisma.room.delete({
      where: { id: roomId },
    });

    return { success: true };
  }
}
