import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ChangeUserBanStatusInputModel } from 'src/features/users/api/models/input/users.input.models';
import { BanInfoRepository } from 'src/features/users/infrastructure/banInfo/banInfo.repository';
import { UsersDevicesRepository } from 'src/features/users/infrastructure/devices/usersDevices-repository';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { FieldError } from 'src/infrastructure/exception.filter.types';

export class ChangeUserBanStatusCommand {
  constructor(
    public userId: string,
    public inputModel: ChangeUserBanStatusInputModel,
  ) {}
}

@CommandHandler(ChangeUserBanStatusCommand)
export class ChangeUserBanStatusUseCase implements ICommandHandler<ChangeUserBanStatusCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersDevicesRepository: UsersDevicesRepository,
    protected usersBanStatusesRepository: BanInfoRepository,
  ) {}
  async execute(command: ChangeUserBanStatusCommand) {
    const userId = Number(command.userId);
    if (isNaN(userId)) {
      throw new BadRequestException([new FieldError('Id syntax error', 'id')]);
    }
    if (!command.inputModel.isBanned) {
      await this.usersBanStatusesRepository.unBanUser(userId);
    } else {
      await this.usersDevicesRepository.deleteAllUserDevices(userId);
      const banInfo = await this.usersBanStatusesRepository.banUser(
        userId,
        command.inputModel.banReason,
        new Date().toISOString(),
      );
      await this.usersRepository.updateBanInfo(userId, banInfo);
    }
    return;
  }
}
