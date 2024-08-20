import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Question } from './entities/question.entity';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { Paginator } from 'src/features/domain/result.types';

@Injectable()
export class QuizQuestionsQueryRepository {
  constructor(@InjectRepository(Question) protected quizRepository: Repository<Question>) {}

  async getQuestions(queryString?: SearchQueryParametersType) {
    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;
    const where: any = {};

    if (sanitizationQuery.publishedStatus === 'published') {
      where.published = true;
    }
    if (sanitizationQuery.publishedStatus === 'notPublished') {
      where.published = false;
    }
    const qb = this.quizRepository.createQueryBuilder('q');
    const query = qb
      .select(['q.id', 'q.body', 'q.correctAnswers', 'q.published', 'q.createdAt', 'q.updatedAt'])
      .orderBy(`q.${sanitizationQuery.sortBy}`, sanitizationQuery.sortDirection)
      .where(where)
      .offset(offset)
      .limit(sanitizationQuery.pageSize)
      .getManyAndCount();
    const [questions, count] = await query;

    return new Paginator<Question[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(count),
      questions,
    );
  }
}
