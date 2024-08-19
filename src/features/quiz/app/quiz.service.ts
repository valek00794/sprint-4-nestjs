import { Injectable, NotFoundException } from '@nestjs/common';

import { QuizRepository } from '../infrastructure/quiz.repository';

@Injectable()
export class QuizService {
  constructor(protected quizRepository: QuizRepository) {}
  async deleteQuestion(id: string): Promise<boolean> {
    if (isNaN(Number(id))) {
      throw new NotFoundException('Question not found');
    }
    return await this.quizRepository.deleteQuestion(Number(id));
  }
}
