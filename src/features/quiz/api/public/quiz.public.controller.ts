import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { SETTINGS } from 'src/settings/settings';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { ConnectGameCommand } from '../../app/useCases/connectGame.useCase';
import { QuizGameQueryRepository } from '../../infrastructure/quizGame.query-repository ';

@UseGuards(AuthBearerGuard)
@Controller(SETTINGS.PATH.quizPairGame)
export class QuizPublicController {
  constructor(
    protected quizGameQueryRepository: QuizGameQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('/connection')
  async connectGame(@Req() req: Request) {
    const game = await this.commandBus.execute(new ConnectGameCommand(req.user!.userId));
    return this.quizGameQueryRepository.mapToOutput(game);
  }
}
