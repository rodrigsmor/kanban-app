import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../auth/auth.service';
import { JwtPayload } from '../@types';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly excludedRoutes = ['/auth'];

  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { url, headers } = req;

    if (this.excludedRoutes.some((route) => url.startsWith(route))) {
      return next();
    }

    const authorizationHeader = headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    const token: string = authorizationHeader.substring(7);

    try {
      const jwtPayload: JwtPayload = await this.authService.validateAccessToken(
        token,
      );
      req['user'] = jwtPayload;

      next();
    } catch (error) {
      throw new UnauthorizedException('');
    }
  }
}
