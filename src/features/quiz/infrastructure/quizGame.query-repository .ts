import { Injectable, Query } from '@nestjs/common';
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
import { getSanitizationQuery } from 'src/features/utils';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { Paginator } from 'src/features/domain/result.types';

@Injectable()
export class QuizGameQueryRepository {
  constructor(@InjectRepository(Game) protected gameRepository: Repository<Game>) {}

  async findCurrentUserGame(playerId: string): Promise<GameOutputModel | null> {
    const game = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstPlayerProgress')
      .leftJoinAndSelect('firstPlayerProgress.player', 'firstPlayer')
      .leftJoinAndSelect('firstPlayerProgress.answers', 'firstPlayerAnswers')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondPlayerProgress')
      .leftJoinAndSelect('secondPlayerProgress.player', 'secondPlayer')
      .leftJoinAndSelect('secondPlayerProgress.answers', 'secondPlayerAnswers')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'question')
      .where('game.status != :status', { status: GameStatuses.Finished })
      .andWhere(
        '(firstPlayerProgress.playerId = :playerId OR secondPlayerProgress.playerId = :playerId)',
        { playerId },
      )
      .orderBy('firstPlayerAnswers.addedAt', 'ASC')
      .addOrderBy('secondPlayerAnswers.addedAt', 'ASC')
      .addOrderBy('questions.index', 'ASC')
      .getOne();
    return game ? this.mapGameToOutput(game) : null;
  }

  async findUserGames(
    playerId: string,
    @Query() queryString?: SearchQueryParametersType,
  ): Promise<Paginator<GameOutputModel[]>> {
    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;

    const orderByField =
      sanitizationQuery.sortBy && sanitizationQuery.sortBy !== 'createdAt'
        ? `game.${sanitizationQuery.sortBy}`
        : 'game.pairCreatedDate';
    const orderDirection = sanitizationQuery.sortDirection || 'DESC';

    const qb = this.gameRepository.createQueryBuilder('game');
    const query = qb
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstPlayerProgress')
      .leftJoinAndSelect('firstPlayerProgress.player', 'firstPlayer')
      .leftJoinAndSelect('firstPlayerProgress.answers', 'firstPlayerAnswers')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondPlayerProgress')
      .leftJoinAndSelect('secondPlayerProgress.player', 'secondPlayer')
      .leftJoinAndSelect('secondPlayerProgress.answers', 'secondPlayerAnswers')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'question')
      .where('(firstPlayer.id = :playerId OR secondPlayer.id = :playerId)', {
        playerId,
      })
      .orderBy(orderByField, orderDirection)
      .skip(offset)
      .take(sanitizationQuery.pageSize)
      .getManyAndCount();

    const [games, count] = await query;

    return new Paginator<GameOutputModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(count),
      games.map((g) => this.mapGameToOutput(g)),
    );
  }

  mapGameToOutput(game: Game): GameOutputModel {
    const firstPlayer = new PlayerOutputModel(
      game.firstPlayerProgress.player.id.toString(),
      game.firstPlayerProgress.player.login,
    );
    let firstPlayerAnswers: AnswerOutputModel[] | null = [];
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
      const secondPlayerAnswers: AnswerOutputModel[] | null = [];
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
    if (game.questions && game.questions.length > 0) {
      questions = game.questions.map(
        (q) => new QuestionViewModel(q.question.id.toString(), q.question.body),
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
