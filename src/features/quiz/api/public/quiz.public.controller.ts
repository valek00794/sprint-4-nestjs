import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { SETTINGS } from 'src/settings/settings';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { ConnectGameCommand } from '../../app/useCases/connectGame.useCase';
import { QuizGameQueryRepository } from '../../infrastructure/quizGame.query-repository ';
import { QuizGameService } from '../../app/quizGame.service';
import { AnswerQuestionGameCommand } from '../../app/useCases/answerQuestion.useCase';
import { AnswerInputModel } from '../models/input/quiz.input.model';
import { SearchQueryParametersType } from 'src/features/domain/query.types';

@UseGuards(AuthBearerGuard)
@Controller(SETTINGS.PATH.quizPairGame)
export class QuizPublicController {
  constructor(
    protected quizGameQueryRepository: QuizGameQueryRepository,
    protected quizGameService: QuizGameService,
    private commandBus: CommandBus,
  ) {}

  @Get('/my')
  async getMyGames(@Req() req: Request, @Query() query?: SearchQueryParametersType) {
    const games = await this.quizGameQueryRepository.findUserGames(req.user!.userId, query);
    return games;
  }

  @Get('/my-current')
  async getCurrentGame(@Req() req: Request) {
    const game = await this.quizGameQueryRepository.findCurrentUserGame(req.user!.userId);
    if (!game) {
      throw new NotFoundException('No active game for current user');
    }
    return game;
  }

  @Get(':id')
  async getGameById(@Req() req: Request, @Param('id') id: string) {
    const game = await this.quizGameService.findGameById(id, req.user!.userId);
    return this.quizGameQueryRepository.mapGameToOutput(game);
  }

  @Post('/connection')
  @HttpCode(HttpStatus.OK)
  async connectGame(@Req() req: Request) {
    const game = await this.commandBus.execute(new ConnectGameCommand(req.user!.userId));
    return this.quizGameQueryRepository.mapGameToOutput(game);
  }

  @Post('/my-current/answers')
  @HttpCode(HttpStatus.OK)
  async answerQuestion(@Req() req: Request, @Body() inputModel: AnswerInputModel) {
    const answer = await this.commandBus.execute(
      new AnswerQuestionGameCommand(req.user!.userId, inputModel),
    );
    return this.quizGameQueryRepository.mapAnswerToOutput(answer);
  }
}
