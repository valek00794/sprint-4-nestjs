import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { QuizGameRepository } from '../infrastructure/quizGame.repository';
import { Game } from '../infrastructure/entities/game.entity';
import { FieldError } from 'src/infrastructure/exception.filter.types';

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
    console.log(game && game.firstPlayerProgress.player.id !== playerIdNumber);
    console.log(
      game.secondPlayerProgress && game.secondPlayerProgress.player.id !== playerIdNumber,
    );
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
}
