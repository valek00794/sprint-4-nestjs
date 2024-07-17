import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { SETTINGS } from 'src/settings/settings';
import { UsersDevicesRepository } from 'src/features/users/infrastructure/devices/usersDevices-repository';
import { UserDeviceInfoType } from 'src/features/users/domain/users.types';
import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';

export class CheckUserByRefreshTokenCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(CheckUserByRefreshTokenCommand)
export class CheckUserByRefreshTokenUseCase
  implements ICommandHandler<CheckUserByRefreshTokenCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
    protected usersDevicesRepository: UsersDevicesRepository,
    protected jwtAdapter: JwtAdapter,
  ) {}
  async execute(command: CheckUserByRefreshTokenCommand): Promise<UserDeviceInfoType> {
    const userVerifyInfo = await this.jwtAdapter.getUserInfoByToken(
      command.refreshToken,
      SETTINGS.JWT.RT_SECRET,
    );
    if (!command.refreshToken || userVerifyInfo === null) {
      throw new UnauthorizedException();
    }

    const isUserExists = await this.usersRepository.findUserById(Number(userVerifyInfo!.userId));
    const deviceSession = await this.usersDevicesRepository.getUserDeviceByDeviceId(
      userVerifyInfo.deviceId,
    );
    if (
      !isUserExists ||
      !deviceSession ||
      new Date(userVerifyInfo!.iat! * 1000).toISOString() !==
        deviceSession?.lastActiveDate.toISOString()
    ) {
      throw new UnauthorizedException();
    }

    const userDeviceInfo: UserDeviceInfoType = {
      userId: userVerifyInfo.userId,
      deviceId: userVerifyInfo.deviceId,
      iat: userVerifyInfo.iat,
      exp: userVerifyInfo.exp,
    };

    return userDeviceInfo;
  }
}
