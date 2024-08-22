import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { PublishQuestionStatusInputModel } from '../../api/models/input/quiz.input.model';
import { QuizQuestionsRepository } from '../../infrastructure/quizQuestions.repository';
import { FieldError } from 'src/infrastructure/exception.filter.types';

export class ChangePublishQuestionStatusCommand {
  constructor(
    public inputModel: PublishQuestionStatusInputModel,
    public id: string,
  ) {}
}

@CommandHandler(ChangePublishQuestionStatusCommand)
export class ChangePublishQuestionStatusUseCase
  implements ICommandHandler<ChangePublishQuestionStatusCommand>
{
  constructor(protected quizRepository: QuizQuestionsRepository) {}

  async execute(command: ChangePublishQuestionStatusCommand) {
    const questionId = Number(command.id);
    if (isNaN(questionId)) {
      throw new NotFoundException('Question not found');
    }
    const question = await this.quizRepository.findQuestionById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    if (command.inputModel.published && !question.correctAnswers.length) {
      throw new BadRequestException([
        new FieldError('Cannot publish question because correctAnswers is empty', 'published'),
      ]);
    }
    const updatedQuestion = {
      published: command.inputModel.published,
      updatedAt: new Date().toISOString(),
    };
    return await this.quizRepository.changePublishQuestionStatus(updatedQuestion, questionId);
  }
}
