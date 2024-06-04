import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { SETTINGS } from 'src/settings/settings';

@Injectable()
export class AuthBasicGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string;

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const buff = Buffer.from(authHeader.slice(6), 'base64');
    const decodedAuth = buff.toString('utf8');

    if (authHeader && decodedAuth === SETTINGS.ADMIN_AUTH && authHeader.slice(0, 6) === 'Basic ') {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
