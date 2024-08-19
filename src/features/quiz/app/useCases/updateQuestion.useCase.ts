import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { QuestionInputModel } from '../../api/models/input/quiz.input.model';
import { QuizRepository } from '../../infrastructure/quiz.repository';

export class UpdateQuestionCommand {
  constructor(
    public inputModel: QuestionInputModel,
    public id: string,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
  constructor(protected quizRepository: QuizRepository) {}

  async execute(command: UpdateQuestionCommand) {
    const questionId = Number(command.id);
    if (isNaN(questionId)) {
      throw new NotFoundException('Question not found');
    }
    const question = await this.quizRepository.findQuestionById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    const updatedQuestion = {
      body: command.inputModel.body,
      correctAnswers: command.inputModel.correctAnswers,
      updatedAt: new Date().toISOString(),
    };
    return await this.quizRepository.updateQuestion(updatedQuestion, questionId);
  }
}
