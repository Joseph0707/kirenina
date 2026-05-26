import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    // Configuration globale (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Prisma (base de données)
    PrismaModule,

    AuthModule,

    PlayersModule,

    RoomsModule,

    // Les modules métier seront ajoutés ici au fur et à mesure :
    // AuthModule,
    // PlayersModule,
    // RoomsModule,
    // GamesModule,
    // WebSocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
