import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';

export class GetAuthBotLinkCommand {
  constructor(public userId?: string) {}
}

@CommandHandler(GetAuthBotLinkCommand)
export class GetAuthBotLinkUseCase implements ICommandHandler<GetAuthBotLinkCommand> {
  constructor(protected usersRepository: UsersRepository) {}

  async execute(command: GetAuthBotLinkCommand) {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.telegramInfo) {
      return;
    }
    return {
      link: `https://t.me/nestjs_4_sprint_test_bot?start=${user.id}`,
    };
  }
}
