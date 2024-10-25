import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validate as uuidValidate } from 'uuid';

import { TelegramAdapter, TelegramPyloadType } from '../telegram.adapter';
import {
  ResultCodes,
  SetInfoAboutTelegramUserCommand,
} from 'src/features/users/app/useCases/integrations/setInfoAboutTelegramUser.useCase';

export class HandleTelegramUpdatesCommand {
  constructor(public payload: TelegramPyloadType) {}
}

@CommandHandler(HandleTelegramUpdatesCommand)
export class HandleTelegramUpdatesUseCase implements ICommandHandler<HandleTelegramUpdatesCommand> {
  constructor(
    protected telegramAdapter: TelegramAdapter,
    private commandBus: CommandBus,
  ) {}

  async execute(command: HandleTelegramUpdatesCommand) {
    let telegramId;
    let userId;
    if (
      command.payload &&
      command.payload.message &&
      command.payload.message.text &&
      command.payload.message.from
    ) {
      userId = command.payload.message.text.split(' ')[1];
      telegramId = command.payload.message.from.id;
      if (uuidValidate(userId)) {
        const result = await this.commandBus.execute(
          new SetInfoAboutTelegramUserCommand(telegramId, userId),
        );
        if (result === ResultCodes.Success) {
          // this.telegramAdapter.sentMessage(
          //   'Поздравляю вы успешно активировали бота, подпишитель на блог и получайте уведомления о новых постах',
          //   telegramId,
          // );
          return;
        }
        if (result === ResultCodes.UserNotFound) {
          this.telegramAdapter.sentMessage(
            'Извините я вас не узнаю, получите новую ссылку для активации бота',
            telegramId,
          );
          return;
        }
        if (result === ResultCodes.UserAlreadyActivatedBotEarly) {
          this.telegramAdapter.sentMessage('Добро пожалоть снова!', telegramId);
          return;
        }
      }
      this.telegramAdapter.sentMessage('Извините я не понимаю вашу команду', telegramId);
      return;
    }

    return;
  }
}
