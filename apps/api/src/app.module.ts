import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    // Configuration globale (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Prisma (base de données)
    PrismaModule,

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
