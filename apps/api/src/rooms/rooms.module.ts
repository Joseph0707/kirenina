import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

@Module({
  providers: [RoomsService],
  controllers: [RoomsController],
  exports: [RoomsService], // Exported for Gateway
})
export class RoomsModule {}
