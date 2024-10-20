import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';

import { QuizGameRepository } from '../../infrastructure/quizGame.repository';
import { GameStatuses } from '../../domain/quiz.types';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { PlayerProgress } from '../../infrastructure/entities/playerProgress.entity';
import { Game } from '../../infrastructure/entities/game.entity';
import { QuizQuestionsRepository } from '../../infrastructure/quizQuestions.repository';

export class ConnectGameCommand {
  constructor(public playerId: string) {}
}

@CommandHandler(ConnectGameCommand)
export class ConnectGameUseCase implements ICommandHandler<ConnectGameCommand> {
  constructor(
    protected gameRepository: QuizGameRepository,
    protected usersRepository: UsersRepository,
    protected questionsRepository: QuizQuestionsRepository,
  ) {}

  async execute(command: ConnectGameCommand) {
    const myActiveGame = await this.gameRepository.findCurrentUserGame(command.playerId);
    if (myActiveGame) {
      throw new ForbiddenException('Current user is already participating in active pair');
    }
    const user = await this.usersRepository.findUserById(command.playerId);
    const playerProgress = new PlayerProgress();
    playerProgress.player = user!;

    const activeGame = await this.gameRepository.findGame(command.playerId);
    if (activeGame) {
      const questions = await this.questionsRepository.getQuestionsForGame(activeGame);
      activeGame.secondPlayerProgress = playerProgress;
      activeGame.status = GameStatuses.Active;
      activeGame.questions = questions.sort((a, b) => a.index - b.index);
      activeGame.startGameDate = new Date().toISOString();

      return await this.gameRepository.saveGame(activeGame);
    }
    const game = new Game();
    game.firstPlayerProgress = playerProgress;
    game.status = GameStatuses.PendingSecondPlayer;
    game.questions = null;
    return await this.gameRepository.saveGame(game);
  }
}
