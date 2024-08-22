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
    if (
      (game && game.firstPlayerProgress.player.id !== Number(playerId)) ||
      (game.secondPlayerProgress && game.secondPlayerProgress.player.id !== Number(playerId))
    ) {
      throw new ForbiddenException(
        'Current user tries to get pair in which user is not participant',
      );
    }
    return game;
  }
}
