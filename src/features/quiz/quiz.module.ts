import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateQuestionUseCase } from './app/useCases/createQuestion.useCase';
import { QuizRepository } from './infrastructure/quiz.repository';
import { Question } from './infrastructure/question.entity';
import { QuizAdminController } from './api/admin/quiz.admin.controller';
import { QuizService } from './app/quiz.service';
import { UpdateQuestionUseCase } from './app/useCases/updateQuestion.useCase';
import { ChangePublishQuestionStatusUseCase } from './app/useCases/changePublishQuestionStatus.useCase';
import { QuizQueryRepository } from './infrastructure/quiz.query-repository';

const quizUseCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  ChangePublishQuestionStatusUseCase,
];

const quizProviders = [QuizService, QuizRepository, QuizQueryRepository];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Question])],
  controllers: [QuizAdminController],
  providers: [...quizProviders, ...quizUseCases],
})
export class QuizModule {}
