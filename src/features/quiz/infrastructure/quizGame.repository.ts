import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Game } from './entities/game.entity';
import { GameStatuses } from '../domain/quiz.types';
import { Answer } from './entities/answer.entity';
import { PlayerProgress } from './entities/playerProgress.entity';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectRepository(Game) protected gameRepository: Repository<Game>,
    @InjectRepository(Answer) protected answersRepository: Repository<Answer>,
    @InjectRepository(PlayerProgress)
    protected playerProgressRepository: Repository<PlayerProgress>,
  ) {}

  async saveAnswer(answer: Answer) {
    await this.playerProgressRepository.save(answer.progress);
    return await this.answersRepository.save(answer);
  }

  async saveGame(game: Game) {
    return await this.gameRepository.save(game);
  }

  async findCurrentUserGame(playerId: number): Promise<Game | null> {
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
      .getOne();

    return game;
  }

  async findGame(playerId: string): Promise<Game | null> {
    const game = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstPlayerProgress')
      .leftJoinAndSelect('firstPlayerProgress.player', 'firstPlayer')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondPlayerProgress')
      .leftJoinAndSelect('secondPlayerProgress.player', 'secondPlayer')
      .where('firstPlayerProgress.playerId != :playerId')
      .setParameter('playerId', playerId)
      .andWhere('game.status = :status', { status: GameStatuses.PendingSecondPlayer })
      .getOne();

    return game;
  }

  async findGameById(id: number): Promise<Game | null> {
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
      .where('game.id = :id', { id })
      .getOne();
    return game;
  }
}
