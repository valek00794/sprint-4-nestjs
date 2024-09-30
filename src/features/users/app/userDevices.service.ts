import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UsersDevicesRepository } from '../infrastructure/devices/usersDevices-repository';
import { CheckUserByRefreshTokenCommand } from './useCases/auth/checkUserByRefreshToken.useCase';

@Injectable()
export class UsersDevicesService {
  constructor(
    protected usersDevicesRepository: UsersDevicesRepository,
    private commandBus: CommandBus,
  ) {}

  async deleteAllDevicesByUser(refreshToken: string) {
    const userVerifyInfo = await this.commandBus.execute(
      new CheckUserByRefreshTokenCommand(refreshToken),
    );
    return await this.usersDevicesRepository.deleteUserDevicesExceptCurrent(userVerifyInfo);
  }
}
