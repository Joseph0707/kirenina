import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/auth/current-user.decorator';
import { createRoomSchema } from '@kirenina/utils';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createRoom(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    const result = createRoomSchema.safeParse(body);
    
    if (!result.success) {
      throw new BadRequestException({
        message: 'Données invalides',
        errors: result.error.errors,
      });
    }

    return this.roomsService.createRoom(user.id, result.data);
  }

  @Get()
  getActiveRooms(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 20;

    return this.roomsService.getActiveRooms(
      isNaN(limit) ? 20 : limit,
      isNaN(page) ? 1 : page,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getRoomById(@Param('id') id: string) {
    return this.roomsService.getRoomById(id);
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  getRoomByCode(@Param('code') code: string) {
    return this.roomsService.getRoomByCode(code.toUpperCase());
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteRoom(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.roomsService.deleteRoom(id, user.id);
  }
}
