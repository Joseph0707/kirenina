import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');

  // CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Cookie parser
  app.use(cookieParser());

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Préfixe API
  app.setGlobalPrefix('api');

  await app.listen(port);
  console.log(`🎮 Kirenina API running on http://localhost:${port}`);
  console.log(`📡 WebSocket ready on ws://localhost:${port}`);
}

bootstrap();
