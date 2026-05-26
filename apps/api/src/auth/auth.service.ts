import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // Player ID
  deviceId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async authenticate(deviceId: string, username: string) {
    // Chercher le joueur
    let player = await this.prisma.player.findUnique({
      where: { deviceId },
    });

    if (!player) {
      // Vérifier que le username n'est pas déjà pris par quelqu'un d'autre
      const existingUsername = await this.prisma.player.findUnique({
        where: { username },
      });

      if (existingUsername) {
        throw new UnauthorizedException('Ce nom de joueur est déjà pris');
      }

      // Créer le joueur
      player = await this.prisma.player.create({
        data: {
          deviceId,
          username,
        },
      });
    }

    // Générer le token JWT
    const token = this.generateToken(player.id, player.deviceId);

    return {
      player,
      token,
    };
  }

  async validatePlayer(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new UnauthorizedException('Joueur introuvable');
    }

    return player;
  }

  private generateToken(playerId: string, deviceId: string): string {
    const secret = this.config.get<string>('JWT_SECRET') || 'secret';
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') || '30d';

    const payload: JwtPayload = {
      sub: playerId,
      deviceId,
    };

    return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
  }
}
