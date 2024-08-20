import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Game } from './entities/game.entity';
import { GameStatuses } from '../domain/quiz.types';
import { PlayerProgress } from './entities/playerProgress.entity';
import { User } from 'src/features/users/infrastructure/users/users.entity';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectRepository(User) protected usersRepository: Repository<User>,
    @InjectRepository(Game) protected gameRepository: Repository<Game>,
    @InjectRepository(PlayerProgress)
    protected playerProgressRepository: Repository<PlayerProgress>,
  ) {}
  async connectGame(playerId: number) {
    const user = await this.usersRepository.findOne({
      where: [{ id: playerId }],
    });
    const playerProgress = new PlayerProgress();
    playerProgress.player = user!;

    const game = new Game();
    game.firstPlayerProgress = playerProgress;
    game.status = GameStatuses.PendingSecondPlayer;

    return await this.gameRepository.save(game);
  }

  async findActiveUserGame(playerId: string): Promise<Game | null> {
    const game = await this.gameRepository
      .createQueryBuilder('game')
      .innerJoinAndSelect('game.firstPlayerProgress', 'firstPlayerProgress')
      .innerJoinAndSelect('firstPlayerProgress.player', 'firstPlayer')
      .innerJoinAndSelect('game.secondPlayerProgress', 'secondPlayerProgress')
      .innerJoinAndSelect('secondPlayerProgress.player', 'secondPlayer')
      .where('firstPlayer.id = :playerId')
      .orWhere('secondPlayer.id = :playerId')
      .setParameter('playerId', playerId)
      .getOne();

    return game;
  }

  // async getNewGame(): Promise<Game | null> {
  //   return await this.gameRepository.findOne({
  //     where: [{ status: GameStatuses.PendingSecondPlayer }],
  //   });
  // }
}
