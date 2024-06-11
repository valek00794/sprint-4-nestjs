import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import type { UserInfo } from 'src/features/users/domain/users.types';

@Injectable()
export class UserIdFromJWT implements NestMiddleware {
  constructor(private jwtService: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const payload = await this.jwtService.decode(token);
      if (payload) {
        if (!req.user) {
          req.user = {} as UserInfo;
        }
        req.user.userId = payload.userId;
      }
    }
    next();
  }
}
