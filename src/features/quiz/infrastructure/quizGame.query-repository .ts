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
  StatisticResultOutputModel,
} from '../api/models/output/quiz.output.model';
import { AnswerStatuses, GameResultStatuses, GameStatuses } from '../domain/quiz.types';
import { Answer } from './entities/answer.entity';
import { getSanitizationQuery, roundScore } from 'src/features/utils';
import { SearchQueryParametersType, SortDirection } from 'src/features/domain/query.types';
import { Paginator } from 'src/features/domain/result.types';
import { PlayerProgress } from './entities/playerProgress.entity';

@Injectable()
export class QuizGameQueryRepository {
  constructor(
    @InjectRepository(Game) protected gameRepository: Repository<Game>,
    @InjectRepository(PlayerProgress)
    protected playerProgressRepository: Repository<PlayerProgress>,
  ) {}

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
    queryString?: SearchQueryParametersType,
  ): Promise<Paginator<GameOutputModel[]>> {
    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;

    const orderByField =
      sanitizationQuery.sortBy && sanitizationQuery.sortBy !== 'createdAt'
        ? `game.${sanitizationQuery.sortBy}`
        : 'game.pairCreatedDate';
    const orderDirection = sanitizationQuery.sortDirection
      ? sanitizationQuery.sortDirection
      : 'DESC';

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
      .addOrderBy('game.pairCreatedDate', 'DESC')
      // .addOrderBy('firstPlayerAnswers.addedAt', 'ASC')
      // .addOrderBy('secondPlayerAnswers.addedAt', 'ASC')
      // .addOrderBy('questions.index', 'ASC')
      .skip(offset)
      .take(sanitizationQuery.pageSize)
      .getManyAndCount();

    const [games, count] = await query;
    const sortedGames = games.map((g) =>
      this.mapGameToOutput({
        ...g,
        firstPlayerProgress: {
          ...g.firstPlayerProgress,
          answers: g.firstPlayerProgress?.answers.sort(
            (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
          ),
        },
        secondPlayerProgress: g.secondPlayerProgress
          ? {
              ...g.secondPlayerProgress,
              answers: g.secondPlayerProgress?.answers.sort(
                (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
              ),
            }
          : null,
        questions: g.questions ? g.questions.sort((a, b) => a.index - b.index) : null,
      }),
    );
    return new Paginator<GameOutputModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(count),
      sortedGames,
    );
  }

  // async getStatistic(playerId: string): Promise<StatisticResultOutputModel> {
  //   const qb = this.playerProgressRepository.createQueryBuilder('gameProgress');
  //   const query = qb
  //     .where('gameProgress.player.id = :playerId ', {
  //       playerId,
  //     })
  //     .getManyAndCount();

  //   const [gameProgresies, count] = await query;

  //   const sumScore = gameProgresies.reduce((sum, p) => (sum = sum + p.score), 0);
  //   const avgScores = roundScore(sumScore / count);
  //   const winsCount = gameProgresies.filter((gp) => gp.result === GameResultStatuses.Win).length;
  //   const lossesCount = gameProgresies.filter((gp) => gp.result === GameResultStatuses.Lose).length;
  //   const drawsCount = gameProgresies.filter((gp) => gp.result === GameResultStatuses.Draw).length;

  //   return new StatisticResultOutputModel(
  //     sumScore,
  //     avgScores,
  //     count,
  //     winsCount,
  //     lossesCount,
  //     drawsCount,
  //   );
  // }

  async getStatistic(playerId: string): Promise<StatisticResultOutputModel> {
    const qb = this.playerProgressRepository.createQueryBuilder('gameProgress');
    const result = await qb
      .select('SUM(gameProgress.score)', 'sumScore')
      .addSelect('AVG(gameProgress.score)', 'avgScores')
      .addSelect('COUNT(*)', 'totalCount')
      .addSelect('SUM(CASE WHEN gameProgress.result = :win THEN 1 ELSE 0 END)', 'winsCount')
      .addSelect('SUM(CASE WHEN gameProgress.result = :lose THEN 1 ELSE 0 END)', 'lossesCount')
      .addSelect('SUM(CASE WHEN gameProgress.result = :draw THEN 1 ELSE 0 END)', 'drawsCount')
      .where('gameProgress.player.id = :playerId', { playerId })
      .setParameters({
        win: GameResultStatuses.Win,
        lose: GameResultStatuses.Lose,
        draw: GameResultStatuses.Draw,
      })
      .getRawOne();

    return new StatisticResultOutputModel(
      Number(result.sumScore),
      roundScore(Number(result.avgScores)),
      Number(result.totalCount),
      Number(result.winsCount),
      Number(result.lossesCount),
      Number(result.drawsCount),
    );
  }

  async getTop(queryString?: SearchQueryParametersType) {
    const sanitizationQuery = getSanitizationQuery(queryString);

    const qb = this.playerProgressRepository.createQueryBuilder('gameProgress');
    const query = qb
      .leftJoinAndSelect('gameProgress.player', 'player')
      .select('player.id', 'playerId')
      .addSelect('player.login', 'login')
      .addSelect('SUM(gameProgress.score)', 'sumScore')
      .addSelect('AVG(gameProgress.score)', 'avgScores')
      .addSelect('COUNT(*)', 'totalCount')
      .addSelect('SUM(CASE WHEN gameProgress.result = :win THEN 1 ELSE 0 END)', 'winsCount')
      .addSelect('SUM(CASE WHEN gameProgress.result = :lose THEN 1 ELSE 0 END)', 'lossesCount')
      .addSelect('SUM(CASE WHEN gameProgress.result = :draw THEN 1 ELSE 0 END)', 'drawsCount')
      .groupBy('player.id')
      .setParameters({
        win: GameResultStatuses.Win,
        lose: GameResultStatuses.Lose,
        draw: GameResultStatuses.Draw,
      });

    if (sanitizationQuery.sort) {
      sanitizationQuery.sort.forEach((sortItem) => {
        const [sortField, sortOrder] = sortItem.split(' ');
        query.addOrderBy(`"${sortField}"`, sortOrder.toUpperCase() as SortDirection);
      });
    }

    const countQuery = this.playerProgressRepository
      .createQueryBuilder('gameProgress')
      .select('COUNT(DISTINCT gameProgress.player)', 'count')
      .getRawOne();

    const count = await countQuery;
    query
      .offset((sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize)
      .limit(sanitizationQuery.pageSize);

    const topPlayers = await query.getRawMany();

    return new Paginator<StatisticResultOutputModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(count.count),
      topPlayers.map(
        (player) =>
          new StatisticResultOutputModel(
            Number(player.sumScore),
            roundScore(Number(player.avgScores)),
            Number(player.totalCount),
            Number(player.winsCount),
            Number(player.lossesCount),
            Number(player.drawsCount),
            { id: player.playerId.toString(), login: player.login },
          ),
      ),
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
      firstPlayerAnswers = game.firstPlayerProgress.answers.map(
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
        secondPlayerProgress.answers = game.secondPlayerProgress.answers.map(
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
