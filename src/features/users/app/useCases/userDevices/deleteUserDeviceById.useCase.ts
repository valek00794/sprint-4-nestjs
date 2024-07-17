import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersDevicesRepository } from '../../../infrastructure/devices/usersDevices-repository';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CheckUserByRefreshTokenCommand } from '../auth/checkUserByRefreshToken.useCase';
import { isUUID } from 'class-validator';

export class DeleteUserDeviceByIdCommand {
  constructor(
    public refreshToken: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteUserDeviceByIdCommand)
export class DeleteUserDeviceByIdUseCase implements ICommandHandler<DeleteUserDeviceByIdCommand> {
  constructor(
    protected usersDevicesRepository: UsersDevicesRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: DeleteUserDeviceByIdCommand) {
    const userVerifyInfo = await this.commandBus.execute(
      new CheckUserByRefreshTokenCommand(command.refreshToken),
    );
    if (userVerifyInfo === null) {
      throw new UnauthorizedException();
    }
    if (!isUUID(command.deviceId)) {
      throw new NotFoundException();
    }
    const device = await this.usersDevicesRepository.getUserDeviceByDeviceId(command.deviceId);
    if (!device) {
      throw new NotFoundException();
    }
    if (userVerifyInfo.userId !== device.userId.toString()) {
      throw new ForbiddenException();
    }
    return await this.usersDevicesRepository.deleteUserDevicebyDeviceId(command.deviceId);
  }
}
