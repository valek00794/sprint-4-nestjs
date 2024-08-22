import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common/exceptions';

import { QuizGameRepository } from '../../infrastructure/quizGame.repository';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { QuizQuestionsRepository } from '../../infrastructure/quizQuestions.repository';
import { AnswerInputModel } from '../../api/models/input/quiz.input.model';
import { AnswerStatuses, GameStatuses } from '../../domain/quiz.types';
import { Answer } from '../../infrastructure/entities/answer.entity';

export class AnswerQuestionGameCommand {
  constructor(
    public playerId: string,
    public inputModel: AnswerInputModel,
  ) {}
}

@CommandHandler(AnswerQuestionGameCommand)
export class AnswerQuestionGameUseCase implements ICommandHandler<AnswerQuestionGameCommand> {
  constructor(
    protected gameRepository: QuizGameRepository,
    protected usersRepository: UsersRepository,
    protected questionsRepository: QuizQuestionsRepository,
  ) {}

  async execute(command: AnswerQuestionGameCommand): Promise<Answer> {
    const playerId = Number(command.playerId);
    const myActiveGame = await this.gameRepository.findCurrentUserGame(playerId);
    let currentPlayer;
    if (myActiveGame?.firstPlayerProgress.player.id === playerId) {
      currentPlayer = 'firstPlayerProgress';
    } else {
      currentPlayer = 'secondPlayerProgress';
    }
    if (
      !myActiveGame ||
      myActiveGame.status !== GameStatuses.Active ||
      (myActiveGame[currentPlayer].answers && myActiveGame[currentPlayer].answers.length === 2)
    ) {
      throw new ForbiddenException(
        'If current user is not inside active pair or user is in active pair but has already answered to all questions',
      );
    }
    let questionId;
    if (!myActiveGame[currentPlayer].answers) {
      questionId = myActiveGame.questions![0].question.id;
    }
    questionId = myActiveGame.questions![myActiveGame[currentPlayer].answers.length].question.id;

    const question = await this.questionsRepository.findQuestionById(questionId);
    let answerStatus = AnswerStatuses.Incorrect;

    if (question?.correctAnswers.includes(command.inputModel.answer)) {
      answerStatus = AnswerStatuses.Correct;
    }
    const answer = new Answer();
    answer.questionId = questionId.toString();
    answer.answerStatus = answerStatus;
    answer.progress = myActiveGame[currentPlayer];

    const userAnswers: Answer[] = [];
    userAnswers.push(answer);
    const savedAnswer = await this.gameRepository.saveAnswer(answer);
    questionId = null;
    return savedAnswer;
  }
}
