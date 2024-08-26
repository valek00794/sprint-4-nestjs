import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Question } from './entities/question.entity';
import { ChangePublishQuestionStatusType, QuestionType } from '../domain/quiz.types';
import { Game } from './entities/game.entity';
import { QuestionOfTheGame } from './entities/questionOfTheGame.entity';
import { GAME_QUESTIONS_COUNT } from '../quizSettings';

@Injectable()
export class QuizQuestionsRepository {
  constructor(
    @InjectRepository(Question) protected quizRepository: Repository<Question>,
    @InjectRepository(QuestionOfTheGame)
    protected questionOfTheGameRepository: Repository<QuestionOfTheGame>,
  ) {}

  async createQuestion(newQuestion: QuestionType) {
    return await this.quizRepository.save(newQuestion);
  }

  async findQuestionById(id: number): Promise<Question | null> {
    return await this.quizRepository.findOne({
      where: [{ id }],
    });
  }

  async getQuestionsForGame(game: Game): Promise<QuestionOfTheGame[]> {
    const questions = await this.quizRepository
      .createQueryBuilder('question')
      .where('question.published = :published', { published: true })
      .orderBy('RANDOM()')
      .take(GAME_QUESTIONS_COUNT)
      .getMany();

    const questionsOfTheGame = questions.map((question, index) => {
      const questionOfTheGame = new QuestionOfTheGame();
      questionOfTheGame.question = question;
      questionOfTheGame.game = game;
      questionOfTheGame.index = index;
      return questionOfTheGame;
    });

    const savedQuestionsOfTheGame = await this.questionOfTheGameRepository.save(questionsOfTheGame);

    return savedQuestionsOfTheGame;
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
