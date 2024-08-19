import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuizRepository } from '../../infrastructure/quiz.repository';
import { QuestionInputModel } from '../../api/models/input/quiz.input.model';

export class CreateQuestionCommand {
  constructor(public inputModel: QuestionInputModel) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  constructor(protected quizRepository: QuizRepository) {}

  async execute(command: CreateQuestionCommand) {
    const newQuestion = {
      body: command.inputModel.body,
      correctAnswers: command.inputModel.correctAnswers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false,
    };
    return await this.quizRepository.createQuestion(newQuestion);
  }
}
