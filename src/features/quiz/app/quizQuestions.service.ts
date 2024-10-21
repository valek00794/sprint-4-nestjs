import { Injectable } from '@nestjs/common';

import { QuizQuestionsRepository } from '../infrastructure/quizQuestions.repository';

@Injectable()
export class QuizQuestionsService {
  constructor(protected quizRepository: QuizQuestionsRepository) {}
  async deleteQuestion(id: string): Promise<boolean> {
    return await this.quizRepository.deleteQuestion(id);
  }
}
