import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ChangeUserBanStatusInputModel } from 'src/features/users/api/models/input/users.input.models';
import { BanInfoRepository } from 'src/features/users/infrastructure/banInfo/banInfo.repository';
import { UsersDevicesRepository } from 'src/features/users/infrastructure/devices/usersDevices-repository';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';

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
    if (!command.inputModel.isBanned) {
      await this.usersBanStatusesRepository.unBanUser(command.userId);
    } else {
      await this.usersDevicesRepository.deleteAllUserDevices(command.userId);
      const banInfo = await this.usersBanStatusesRepository.banUser(
        command.userId,
        command.inputModel.banReason,
        new Date().toISOString(),
      );
      await this.usersRepository.updateBanInfo(command.userId, banInfo);
    }
    return;
  }
}
