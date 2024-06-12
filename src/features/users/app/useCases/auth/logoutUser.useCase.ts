import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersDevicesRepository } from 'src/features/users/infrastructure/devices/usersDevices-repository';
import { CheckUserByRefreshTokenCommand } from './checkUserByRefreshToken.useCase';

export class LogoutUserCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    protected usersDevicesRepository: UsersDevicesRepository,
    private commandBus: CommandBus,
  ) {}
  async execute(command: LogoutUserCommand): Promise<true> {
    const userVerifyInfo = await this.commandBus.execute(
      new CheckUserByRefreshTokenCommand(command.refreshToken),
    );
    await this.usersDevicesRepository.deleteUserDevicebyId(userVerifyInfo.deviceId);
    return true;
  }
}
