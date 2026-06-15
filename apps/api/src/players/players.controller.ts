import { Controller, Get, Patch, Body, UseGuards, Query, Param } from '@nestjs/common';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/auth/current-user.decorator';
import { updatePlayerSchema } from '@kirenina/utils';
import { BadRequestException } from '@nestjs/common';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.playersService.getProfile(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    const result = updatePlayerSchema.safeParse(body);
    
    if (!result.success) {
      throw new BadRequestException({
        message: 'Données invalides',
        errors: result.error.errors,
      });
    }

    return this.playersService.updateProfile(user.id, result.data);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    return this.playersService.getLeaderboard(isNaN(limit) ? 10 : limit);
  }

  @Get(':id')
  getPublicProfile(@Param('id') id: string) {
    return this.playersService.getPublicProfile(id);
  }
}
