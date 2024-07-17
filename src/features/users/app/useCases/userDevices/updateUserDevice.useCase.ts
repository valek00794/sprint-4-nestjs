import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersDevicesRepository } from '../../../infrastructure/devices/usersDevices-repository';
import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { SETTINGS } from 'src/settings/settings';

export class UpdateUserDeviceCommand {
  constructor(
    public oldRefreshToken: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(UpdateUserDeviceCommand)
export class UpdateUserDeviceUseCase implements ICommandHandler<UpdateUserDeviceCommand> {
  constructor(
    protected usersDevicesRepository: UsersDevicesRepository,
    protected jwtAdapter: JwtAdapter,
  ) {}

  async execute(command: UpdateUserDeviceCommand) {
    const userVerifyInfoByOldToken = await this.jwtAdapter.getUserInfoByToken(
      command.oldRefreshToken,
      SETTINGS.JWT.RT_SECRET,
    );
    const userVerifyInfo = await this.jwtAdapter.getUserInfoByToken(
      command.refreshToken,
      SETTINGS.JWT.RT_SECRET,
    );
    const newLastActiveDate = new Date(userVerifyInfo!.iat! * 1000);
    const newExpiryDate = new Date(userVerifyInfo!.exp! * 1000);
    return await this.usersDevicesRepository.updateUserDevice(
      userVerifyInfoByOldToken!,
      newLastActiveDate,
      newExpiryDate,
    );
  }
}
