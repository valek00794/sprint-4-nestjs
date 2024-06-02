import { Injectable } from '@nestjs/common';

import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import { JWTTokensOutType } from './jwt-types';
import { SETTINGS } from 'src/settings/settings';
import type { UserDeviceInfoType } from 'src/features/users/domain/users.types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAdapter {
  constructor(private jwtService: JwtService) {}
  async createJWTs(userId: ObjectId, deviceId?: string): Promise<JWTTokensOutType> {
    const accessToken = await this.jwtService.signAsync(
      { userId },
      {
        secret: SETTINGS.JWT.AT_SECRET,
        expiresIn: SETTINGS.JWT.AT_EXPIRES_TIME,
      },
    );

    const getDeviceId = deviceId ? deviceId : uuidv4();

    const refreshToken = await this.jwtService.signAsync(
      { userId, deviceId: getDeviceId },
      {
        secret: SETTINGS.JWT.RT_SECRET,
        expiresIn: SETTINGS.JWT.RT_EXPIRES_TIME,
      },
    );
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async getUserInfoByToken(token: string, secret: string): Promise<UserDeviceInfoType | null> {
    try {
      const res = await this.jwtService.verifyAsync(token, { secret });
      if (typeof res !== 'string') {
        return { userId: res.userId, deviceId: res.deviceId, iat: res.iat, exp: res.exp };
      }
    } catch (error) {
      console.error('Token verify error');
    }
    return null;
  }
}
