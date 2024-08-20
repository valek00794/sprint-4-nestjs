import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Question } from './entities/question.entity';
import { ChangePublishQuestionStatusType, QuestionType } from '../domain/quiz.types';

@Injectable()
export class QuizQuestionsRepository {
  constructor(@InjectRepository(Question) protected quizRepository: Repository<Question>) {}

  async createQuestion(newQuestion: QuestionType) {
    return await this.quizRepository.save(newQuestion);
  }

  async findQuestionById(id: number): Promise<Question | null> {
    return await this.quizRepository.findOne({
      where: [{ id }],
    });
  }

  async updateQuestion(updatedQuestion: QuestionType, id: number): Promise<Question | null> {
    const question = await this.quizRepository.findOne({
      where: { id },
    });
    if (question) {
      question.body = updatedQuestion.body;
      question.correctAnswers = updatedQuestion.correctAnswers;
      question.updatedAt = updatedQuestion.updatedAt;

      await this.quizRepository.save(question);
      return question;
    } else {
      return null;
    }
  }

  async changePublishQuestionStatus(
    updatedQuestion: ChangePublishQuestionStatusType,
    id: number,
  ): Promise<Question | null> {
    const question = await this.quizRepository.findOne({
      where: { id },
    });
    if (question) {
      question.published = updatedQuestion.published;
      question.updatedAt = updatedQuestion.updatedAt;

      await this.quizRepository.save(question);
      return question;
    } else {
      return null;
    }
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const result = await this.quizRepository.delete({ id });
    return result.affected === 1 ? true : false;
  }
}
