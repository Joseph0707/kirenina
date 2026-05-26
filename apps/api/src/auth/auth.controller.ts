import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { createPlayerSchema } from '@kirenina/utils';
import { z } from 'zod';

// On utilise un pipe manuel pour zod, ou on valide directement dans le contrôleur pour l'instant
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Validation Zod
    const result = createPlayerSchema.safeParse(body);
    
    if (!result.success) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Données invalides',
        errors: result.error.errors,
      });
    }

    const { deviceId, username } = result.data;
    
    const { player, token } = await this.authService.authenticate(deviceId, username);

    // Optionnel : Définir un cookie HTTP-only pour plus de sécurité (utile pour de futures requêtes Web)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    });

    return {
      player,
      token, // On renvoie aussi le token pour le Socket.IO
    };
  }
}
