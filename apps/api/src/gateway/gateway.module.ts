import { Module } from '@nestjs/common';
import { GameGateway } from './game/game.gateway';
import { AuthModule } from '../auth/auth.module';
import { RoomsModule } from '../rooms/rooms.module';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [AuthModule, RoomsModule, PlayersModule],
  providers: [GameGateway],
})
export class GatewayModule {}
