import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: { sub: string; publicId: string; role: string; type: 'access' | 'refresh' };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    try {
      request.user = await this.jwtService.verifyAsync<AuthenticatedRequest['user']>(token);
      if (request.user.type !== 'access') {
        throw new UnauthorizedException('Access token is required');
      }
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      return undefined;
    }
    return authorization.slice(7).trim() || undefined;
  }
}
