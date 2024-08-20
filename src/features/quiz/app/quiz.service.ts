import { Injectable, NotFoundException } from '@nestjs/common';

import { QuizQuestionsRepository } from '../infrastructure/quizQuestions.repository';

@Injectable()
export class QuizService {
  constructor(protected quizRepository: QuizQuestionsRepository) {}
  async deleteQuestion(id: string): Promise<boolean> {
    if (isNaN(Number(id))) {
      throw new NotFoundException('Question not found');
    }
    return await this.quizRepository.deleteQuestion(Number(id));
  }
}
