import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateQuestionUseCase } from './app/useCases/createQuestion.useCase';
import { QuizQuestionsRepository } from './infrastructure/quizQuestions.repository';
import { Question } from './infrastructure/entities/question.entity';
import { QuizAdminController } from './api/admin/quiz.admin.controller';
import { QuizQuestionsService } from './app/quizQuestions.service';
import { UpdateQuestionUseCase } from './app/useCases/updateQuestion.useCase';
import { ChangePublishQuestionStatusUseCase } from './app/useCases/changePublishQuestionStatus.useCase';
import { QuizQuestionsQueryRepository } from './infrastructure/quizQuestions.query-repository';
import { ConnectGameUseCase } from './app/useCases/connectGame.useCase';
import { PlayerProgress } from './infrastructure/entities/playerProgress.entity';
import { Game } from './infrastructure/entities/game.entity';
import { Answer } from './infrastructure/entities/answer.entity';
import { QuizGameRepository } from './infrastructure/quizGame.repository';
import { User } from '../users/infrastructure/users/user.entity';
import { QuizPublicController } from './api/public/quiz.public.controller';
import { QuizGameQueryRepository } from './infrastructure/quizGame.query-repository ';
import { QuizGameService } from './app/quizGame.service';
import { UsersRepository } from '../users/infrastructure/users/users.repository';
import { UserEmailConfirmationInfo } from '../users/infrastructure/users/usersEmailConfirmationInfo.entity';
import { UsersRecoveryPasssword } from '../users/infrastructure/users/usersRecoveryPasssword.entity';
import { AnswerQuestionGameUseCase } from './app/useCases/answerQuestion.useCase';
import { QuestionOfTheGame } from './infrastructure/entities/questionOfTheGame.entity';
import { UserTelegramInfo } from '../users/infrastructure/integratons/userTelegramInfo.entity';

const quizAdminUseCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  ChangePublishQuestionStatusUseCase,
  AnswerQuestionGameUseCase,
];

const quizPublicUseCases = [ConnectGameUseCase];

const quizProviders = [
  QuizQuestionsService,
  QuizQuestionsRepository,
  QuizQuestionsQueryRepository,
  QuizGameService,
  QuizGameRepository,
  QuizGameQueryRepository,
  UsersRepository,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      User,
      Question,
      QuestionOfTheGame,
      Game,
      Answer,
      PlayerProgress,
      UserEmailConfirmationInfo,
      UsersRecoveryPasssword,
      UserTelegramInfo,
    ]),
  ],
  controllers: [QuizAdminController, QuizPublicController],
  providers: [...quizProviders, ...quizAdminUseCases, ...quizPublicUseCases],
})
export class QuizModule {}
