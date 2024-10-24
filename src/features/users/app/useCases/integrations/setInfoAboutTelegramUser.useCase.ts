import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';

export const ResultCodes = {
  Success: Symbol('success'),
  Fail: Symbol('dail'),
  UserNotFound: Symbol('userNotFound'),
  UserAlreadyActivatedBotEarly: Symbol('userAlreadyActivatedBotEarly'),
};

export class SetInfoAboutTelegramUserCommand {
  constructor(
    public telegramUserId: number,
    public userId: string,
  ) {}
}

@CommandHandler(SetInfoAboutTelegramUserCommand)
export class SetInfoAboutTelegramUserUseCase
  implements ICommandHandler<SetInfoAboutTelegramUserCommand>
{
  constructor(protected usersRepository: UsersRepository) {}

  async execute(command: SetInfoAboutTelegramUserCommand) {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) {
      return ResultCodes.UserNotFound;
    }
    if (user.telegramInfo && user.telegramInfo.telegramId === command.telegramUserId) {
      return ResultCodes.UserAlreadyActivatedBotEarly;
    }
    const result = await this.usersRepository.setUserTelegramInfo(
      command.userId,
      command.telegramUserId,
    );
    if (result) {
      return ResultCodes.Success;
    }
    return ResultCodes.Fail;
  }
}
