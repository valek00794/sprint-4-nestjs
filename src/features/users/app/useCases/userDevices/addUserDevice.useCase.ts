import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersDevicesRepository } from '../../../infrastructure/devices/usersDevices-repository';
import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { SETTINGS } from 'src/settings/settings';

export class AddUserDeviceCommand {
  constructor(
    public refreshToken: string,
    public deviceTitle: string,
    public ipAddress: string,
  ) {}
}

@CommandHandler(AddUserDeviceCommand)
export class AddUserDeviceUseCase implements ICommandHandler<AddUserDeviceCommand> {
  constructor(
    protected usersDevicesRepository: UsersDevicesRepository,
    protected jwtAdapter: JwtAdapter,
  ) {}

  async execute(command: AddUserDeviceCommand) {
    const userVerifyInfo = await this.jwtAdapter.getUserInfoByToken(
      command.refreshToken,
      SETTINGS.JWT.RT_SECRET,
    );
    const device = {
      deviceId: userVerifyInfo!.deviceId,
      title: command.deviceTitle,
      userId: Number(userVerifyInfo!.userId),
      ip: command.ipAddress,
      lastActiveDate: new Date(userVerifyInfo!.iat! * 1000),
      expiryDate: new Date(userVerifyInfo!.exp! * 1000),
    };
    return await this.usersDevicesRepository.addUserDevice(device);
  }
}
