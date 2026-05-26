import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get(':id/state')
  async getGameState(@Param('id') id: string) {
    return this.gamesService.getGameState(id);
  }
}
