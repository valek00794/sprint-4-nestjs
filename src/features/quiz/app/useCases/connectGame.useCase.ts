import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../infrastructure/quizGame.repository';
import { GameStatuses } from '../../domain/quiz.types';
import { ForbiddenException } from '@nestjs/common';

export class ConnectGameCommand {
  constructor(public playerId: string) {}
}

@CommandHandler(ConnectGameCommand)
export class ConnectGameUseCase implements ICommandHandler<ConnectGameCommand> {
  constructor(protected gameRepository: QuizGameRepository) {}

  async execute(command: ConnectGameCommand) {
    const game = await this.gameRepository.findActiveUserGame(command.playerId);
    if (game !== null && game.status === GameStatuses.Active) {
      throw new ForbiddenException('Current user is already participating in active pair');
    }
    if (game !== null && game.status === GameStatuses.PendingSecondPlayer) {
      return game;
    }
    return await this.gameRepository.connectGame(Number(command.playerId));
  }
}
