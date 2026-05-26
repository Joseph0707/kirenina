import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../auth/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request) || this.extractTokenFromCookie(request);
    
    if (!token) {
      throw new UnauthorizedException('Non authentifié');
    }
    
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'secret';
      const payload = jwt.verify(token, secret) as JwtPayload;
      
      // On attache les infos du joueur à l'objet request
      (request as any).user = { id: payload.sub, deviceId: payload.deviceId };
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.['token'];
  }
}
