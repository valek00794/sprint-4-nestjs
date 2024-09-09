import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { QuizGameRepository } from '../infrastructure/quizGame.repository';
import { Game } from '../infrastructure/entities/game.entity';
import { FieldError } from 'src/infrastructure/exception.filter.types';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GameResultStatuses, GameStatuses } from '../domain/quiz.types';
import { PlayerProgress } from '../infrastructure/entities/playerProgress.entity';
import { GAME_QUESTIONS_COUNT } from '../quizSettings';

@Injectable()
export class QuizGameService {
  constructor(protected gameRepository: QuizGameRepository) {}
  async findGameById(id: string, playerId: string): Promise<Game> {
    if (isNaN(Number(id))) {
      throw new BadRequestException([new FieldError('Invalid game id', 'id')]);
    }
    const game = await this.gameRepository.findGameById(Number(id));
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    const playerIdNumber = Number(playerId);
    if (
      (!game.firstPlayerProgress || game.firstPlayerProgress.player.id !== playerIdNumber) &&
      (!game.secondPlayerProgress || game.secondPlayerProgress.player.id !== playerIdNumber)
    ) {
      throw new ForbiddenException(
        'Current user tries to get pair in which user is not participant',
      );
    }
    return game;
  }
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkActiveGames() {
    const activeGames = await this.gameRepository.findActiveGames();

    for (const game of activeGames) {
      const firstPlayerAnswersCount = game.firstPlayerProgress.answers.length;
      const secondPlayerAnswersCount = game.secondPlayerProgress!.answers.length;

      if (firstPlayerAnswersCount === GAME_QUESTIONS_COUNT) {
        const finishTime =
          new Date(game.firstPlayerProgress.answers[GAME_QUESTIONS_COUNT - 1].addedAt).getTime() +
          10000;
        const currentTime = Date.now();

        if (currentTime >= finishTime) {
          this.finishGame(game, game.firstPlayerProgress, game.secondPlayerProgress!, finishTime);
        }
      }

      if (secondPlayerAnswersCount === GAME_QUESTIONS_COUNT) {
        const finishTime =
          new Date(game.secondPlayerProgress!.answers[GAME_QUESTIONS_COUNT - 1].addedAt).getTime() +
          10000;
        const currentTime = Date.now();

        if (currentTime >= finishTime) {
          this.finishGame(game, game.secondPlayerProgress!, game.firstPlayerProgress, finishTime);
        }
      }
    }
  }

  private async finishGame(
    game: Game,
    playerWhoAnswered: PlayerProgress,
    otherPlayer: PlayerProgress,
    finishTime: number,
  ) {
    if (playerWhoAnswered.score > 0) {
      playerWhoAnswered.score += 1;
    }
    game.finishGameDate = new Date(finishTime).toISOString();
    if (playerWhoAnswered.score > otherPlayer.score) {
      playerWhoAnswered.result = GameResultStatuses.Win;
      otherPlayer.result = GameResultStatuses.Lose;
    } else if (playerWhoAnswered.score < otherPlayer.score) {
      playerWhoAnswered.result = GameResultStatuses.Lose;
      otherPlayer.result = GameResultStatuses.Win;
    } else {
      playerWhoAnswered.result = GameResultStatuses.Draw;
      otherPlayer.result = GameResultStatuses.Draw;
    }

    game.status = GameStatuses.Finished;
    await this.gameRepository.saveGame(game);
  }
}
