import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import type { UsersRepository } from '../infrastructure/users/users.repository';
import { bcryptArapter } from 'src/infrastructure/adapters/bcrypt.adapter';
import { emailManager } from '../domain/managers/email-manager';
import { jwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { ResultStatus, SETTINGS, StatusCodes } from 'src/settings/settings';
import type { UsersDevicesRepository } from '../infrastructure/devices/usersDevices-repository';
import type { UserDeviceInfoType } from '../domain/users.types';
import type { JWTTokensOutType } from 'src/infrastructure/adapters/jwt/jwt-types';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersDevicesRepository: UsersDevicesRepository,
  ) {}

  async checkCredential(userId: string, password: string, passwordHash: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByConfirmationCodeOrUserId(userId);
    if (user !== null && !user.emailConfirmation!.isConfirmed) return false;
    const isAuth = await bcryptArapter.checkPassword(password, passwordHash);
    return isAuth ? true : false;
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByConfirmationCodeOrUserId(code);
    if (user === null) {
      throw new NotFoundException('User not found');
    }
    const userConfirmationInfo = user.emailConfirmation;

    if (user !== null && userConfirmationInfo !== null) {
      if (userConfirmationInfo!.isConfirmed) {
        throw new BadRequestException('User with current confirmation code already confirmed');
      }
      if (userConfirmationInfo.confirmationCode !== code) {
        throw new BadRequestException('Verification code does not match');
      }
      if (userConfirmationInfo.expirationDate < new Date()) {
        throw new BadRequestException('Verification code has expired, needs to be requested again');
      }
    }

    await this.usersRepository.updateConfirmation(user!._id.toString());
    return true;
  }

  async resentConfirmEmail(email: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);
    if (user === null) {
      throw new NotFoundException('User with current email not found');
    }
    const userConfirmationInfo = user.emailConfirmation;
    if (userConfirmationInfo !== null && userConfirmationInfo.isConfirmed) {
      throw new BadRequestException('User with current email already confirmed');
    }

    const newUserConfirmationInfo = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
      }),
      isConfirmed: false,
    };

    try {
      await emailManager.sendEmailConfirmationMessage(
        email,
        newUserConfirmationInfo.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      this.usersRepository.deleteUserById(user!._id!.toString());
      throw new ServiceUnavailableException('Error sending confirmation email');
    }

    await this.usersRepository.updateConfirmationInfo(
      user._id!.toString(),
      newUserConfirmationInfo,
    );
    return true;
  }

  async checkUserByRefreshToken(oldRefreshToken: string): Promise<UserDeviceInfoType | null> {
    const userVerifyInfo = await jwtAdapter.getUserInfoByToken(
      oldRefreshToken,
      SETTINGS.JWT.RT_SECRET,
    );
    if (!oldRefreshToken || userVerifyInfo === null) {
      throw new NotFoundException('User not found');
    }

    const isUserExists = await this.usersRepository.findUserById(userVerifyInfo!.userId);
    const deviceSession = await this.usersDevicesRepository.getUserDeviceById(
      userVerifyInfo.deviceId,
    );
    if (
      !isUserExists ||
      !deviceSession ||
      new Date(userVerifyInfo!.iat! * 1000).toISOString() !== deviceSession?.lastActiveDate
    ) {
      throw new NotFoundException('User not found');
    }

    const userDeviceInfo: UserDeviceInfoType = {
      userId: userVerifyInfo.userId,
      deviceId: userVerifyInfo.deviceId,
      iat: userVerifyInfo.iat,
      exp: userVerifyInfo.exp,
    };

    return userDeviceInfo;
  }

  async renewTokens(oldRefreshToken: string): Promise<JWTTokensOutType | null> {
    const userVerifyInfo = await this.checkUserByRefreshToken(oldRefreshToken);
    if (userVerifyInfo === null) {
      throw new UnauthorizedException();
    }
    const tokens = await jwtAdapter.createJWT(
      new Types.ObjectId(userVerifyInfo.userId),
      userVerifyInfo.deviceId,
    );
    return tokens;
  }

  async logoutUser(oldRefreshToken: string): Promise<null> {
    const userVerifyInfo = await this.checkUserByRefreshToken(oldRefreshToken);
    if (userVerifyInfo === null) {
      throw new UnauthorizedException();
    }
    await this.usersDevicesRepository.deleteUserDevicebyId(userVerifyInfo.deviceId);
    throw new HttpException(ResultStatus.NoContent, StatusCodes.NO_CONTENT_204);
  }
}
