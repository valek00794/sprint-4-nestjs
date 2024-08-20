import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateQuestionUseCase } from './app/useCases/createQuestion.useCase';
import { QuizQuestionsRepository } from './infrastructure/quizQuestions.repository';
import { Question } from './infrastructure/entities/question.entity';
import { QuizAdminController } from './api/admin/quiz.admin.controller';
import { QuizService } from './app/quiz.service';
import { UpdateQuestionUseCase } from './app/useCases/updateQuestion.useCase';
import { ChangePublishQuestionStatusUseCase } from './app/useCases/changePublishQuestionStatus.useCase';
import { QuizQuestionsQueryRepository } from './infrastructure/quizQuestions.query-repository';
import { ConnectGameUseCase } from './app/useCases/connectGame.useCase';
import { PlayerProgress } from './infrastructure/entities/playerProgress.entity';
import { Game } from './infrastructure/entities/game.entity';
import { Answer } from './infrastructure/entities/answer.entity';
import { QuizGameRepository } from './infrastructure/quizGame.repository';
import { User } from '../users/infrastructure/users/users.entity';
import { QuizPublicController } from './api/public/quiz.public.controller';
import { QuizGameQueryRepository } from './infrastructure/quizGame.query-repository ';

const quizAdminUseCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  ChangePublishQuestionStatusUseCase,
];

const quizPublicUseCases = [ConnectGameUseCase];

const quizProviders = [
  QuizService,
  QuizQuestionsRepository,
  QuizQuestionsQueryRepository,
  QuizGameRepository,
  QuizGameQueryRepository,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User, Question, Game, Answer, PlayerProgress])],
  controllers: [QuizAdminController, QuizPublicController],
  providers: [...quizProviders, ...quizAdminUseCases, ...quizPublicUseCases],
})
export class QuizModule {}
