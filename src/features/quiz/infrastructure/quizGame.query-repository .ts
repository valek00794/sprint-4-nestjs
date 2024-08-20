import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Game } from './entities/game.entity';
import {
  AnswerOutputModel,
  GameOutputModel,
  PlayerOutputModel,
  PlayerProgressOutputModel,
  QuestionViewModel,
} from '../api/models/output/quiz.output.model';
import { AnswerStatuses } from '../domain/quiz.types';

@Injectable()
export class QuizGameQueryRepository {
  constructor(@InjectRepository(Game) protected gameRepository: Repository<Game>) {}
  mapToOutput(game: Game): GameOutputModel {
    const firstPlayer = new PlayerOutputModel(
      game.firstPlayerProgress.id.toString(),
      game.firstPlayerProgress.player.login,
    );
    let firstPlayerAnswers: AnswerOutputModel[] | null = null;
    let secondPlayerProgress: PlayerProgressOutputModel | null = null;
    if (game.firstPlayerProgress.answers) {
      firstPlayerAnswers = game.firstPlayerProgress.answers?.map(
        (answer) =>
          new AnswerOutputModel(
            answer.questionId,
            answer.answerStatus as AnswerStatuses,
            answer.addedAt,
          ),
      );
    }
    const firstPlayerProgress = new PlayerProgressOutputModel(
      firstPlayerAnswers,
      firstPlayer,
      game.firstPlayerProgress.score,
    );
    if (game.secondPlayerProgress) {
      let secondPlayerAnswers: AnswerOutputModel[] | null = null;
      const secondPlayer = new PlayerOutputModel(
        game.secondPlayerProgress.id.toString(),
        game.secondPlayerProgress.player.login,
      );

      if (game.secondPlayerProgress.answers) {
        secondPlayerAnswers = game.secondPlayerProgress.answers?.map(
          (answer) =>
            new AnswerOutputModel(
              answer.questionId,
              answer.answerStatus as AnswerStatuses,
              answer.addedAt,
            ),
        );
        secondPlayerProgress = new PlayerProgressOutputModel(
          secondPlayerAnswers,
          secondPlayer,
          game.secondPlayerProgress.score,
        );
      }
    }
    let questions: QuestionViewModel[] | null = null;
    if (game.questions) {
      questions = game.questions.map((q) => new QuestionViewModel(q.id.toString(), q.body));
    }
    return new GameOutputModel(
      game.id.toString(),
      firstPlayerProgress,
      secondPlayerProgress,
      questions,
      game.status,
      game.pairCreatedDate,
      game.startGameDate,
      game.finishGameDate,
    );
  }
}
