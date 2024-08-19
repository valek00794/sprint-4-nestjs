import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  HttpStatus,
  UseGuards,
  NotFoundException,
  HttpCode,
  Query,
  Get,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
import { SETTINGS } from 'src/settings/settings';
import {
  PublishQuestionStatusInputModel,
  QuestionInputModel,
} from '../models/input/quiz.input.model';
import { CreateQuestionCommand } from '../../app/useCases/createQuestion.useCase';
import { QuizService } from '../../app/quiz.service';
import { UpdateQuestionCommand } from '../../app/useCases/updateQuestion.useCase';
import { ChangePublishQuestionStatusCommand } from '../../app/useCases/changePublishQuestionStatus.useCase';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { QuizQueryRepository } from '../../infrastructure/quiz.query-repository';

@Public()
@UseGuards(AuthBasicGuard)
@Controller(SETTINGS.PATH.quizSa)
export class QuizAdminController {
  constructor(
    protected quizService: QuizService,
    protected quizQueryRepository: QuizQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getQuestions(@Query() query?: SearchQueryParametersType) {
    return await this.quizQueryRepository.getQuestions(query);
  }

  @Post()
  async createQuestion(@Body() inputModel: QuestionInputModel) {
    return await this.commandBus.execute(new CreateQuestionCommand(inputModel));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') id: string) {
    const deleteResult = await this.quizService.deleteQuestion(id);
    if (!deleteResult) {
      throw new NotFoundException('Question not found');
    }
    return deleteResult;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(@Body() inputModel: QuestionInputModel, @Param('id') id: string) {
    await this.commandBus.execute(new UpdateQuestionCommand(inputModel, id));
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePublishQuestionStatus(
    @Body() inputModel: PublishQuestionStatusInputModel,
    @Param('id') id: string,
  ) {
    await this.commandBus.execute(new ChangePublishQuestionStatusCommand(inputModel, id));
  }
}
