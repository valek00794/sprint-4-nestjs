import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Game } from './entities/game.entity';
import {
  AnswerOutputModel,
  GameOutputModel,
  PlayerOutputModel,
  PlayerProgressOutputModel,
  QuestionViewModel,
} from '../api/models/output/quiz.output.model';
import { AnswerStatuses, GameStatuses } from '../domain/quiz.types';
import { Answer } from './entities/answer.entity';

@Injectable()
export class QuizGameQueryRepository {
  constructor(@InjectRepository(Game) protected gameRepository: Repository<Game>) {}

  async findCurrentUserGame(playerId: string): Promise<GameOutputModel | null> {
    const game = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstPlayerProgress')
      .leftJoinAndSelect('firstPlayerProgress.player', 'firstPlayer')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondPlayerProgress')
      .leftJoinAndSelect('secondPlayerProgress.player', 'secondPlayer')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'question')
      .where('game.status != :status', { status: GameStatuses.Finished })
      .andWhere(
        '(firstPlayerProgress.playerId = :playerId OR secondPlayerProgress.playerId = :playerId)',
        { playerId },
      )
      .getOne();
    return game ? this.mapGameToOutput(game) : null;
  }

  mapGameToOutput(game: Game): GameOutputModel {
    const firstPlayer = new PlayerOutputModel(
      game.firstPlayerProgress.player.id.toString(),
      game.firstPlayerProgress.player.login,
    );
    let firstPlayerAnswers: AnswerOutputModel[] | null = null;
    let secondPlayerProgress: PlayerProgressOutputModel | null = null;
    if (game.firstPlayerProgress.answers) {
      firstPlayerAnswers = game.firstPlayerProgress.answers?.map(
        (answer) =>
          new AnswerOutputModel(
            answer.questionId,
            answer.answerStatus as AnswerStatuses,
            answer.addedAt,
          ),
      );
    }
    const firstPlayerProgress = new PlayerProgressOutputModel(
      firstPlayerAnswers,
      firstPlayer,
      game.firstPlayerProgress.score,
    );

    if (game.secondPlayerProgress) {
      const secondPlayerAnswers: AnswerOutputModel[] | null = null;
      const secondPlayer = new PlayerOutputModel(
        game.secondPlayerProgress.player.id.toString(),
        game.secondPlayerProgress.player.login,
      );
      secondPlayerProgress = new PlayerProgressOutputModel(
        secondPlayerAnswers,
        secondPlayer,
        game.secondPlayerProgress.score,
      );
      if (game.secondPlayerProgress.answers) {
        secondPlayerProgress.answers = game.secondPlayerProgress.answers?.map(
          (answer) =>
            new AnswerOutputModel(
              answer.questionId,
              answer.answerStatus as AnswerStatuses,
              answer.addedAt,
            ),
        );
      }
    }
    let questions: QuestionViewModel[] | null = null;
    if (game.questions) {
      questions = game.questions.map(
        (q) => new QuestionViewModel(q.id.toString(), q.question.body),
      );
    }
    return new GameOutputModel(
      game.id.toString(),
      firstPlayerProgress,
      secondPlayerProgress,
      questions,
      game.status,
      game.pairCreatedDate,
      game.startGameDate,
      game.finishGameDate,
    );
  }
  mapAnswerToOutput(answer: Answer): AnswerOutputModel {
    return new AnswerOutputModel(answer.questionId, answer.answerStatus, answer.addedAt);
  }
}
