import { AnswerStatuses, GameStatuses } from 'src/features/quiz/domain/quiz.types';
export class QuestionViewModel {
  constructor(
    public id: string,
    public body: string,
  ) {}
}

export class PlayerOutputModel {
  constructor(
    public id: string,
    public login: string,
  ) {}
}

export class AnswerOutputModel {
  constructor(
    public questionId: string,
    public answerStatus: AnswerStatuses,
    public addedAt: string,
  ) {}
}

export class PlayerProgressOutputModel {
  constructor(
    public answers: AnswerOutputModel[] | null,
    public player: PlayerOutputModel,
    public score: number,
  ) {}
}

export class GameOutputModel {
  constructor(
    public id: string,
    public firstPlayerProgress: PlayerProgressOutputModel,
    public secondPlayerProgress: PlayerProgressOutputModel | null,
    public questions: QuestionViewModel[] | null,
    public status: GameStatuses,
    public pairCreatedDate: string,
    public startGameDate: string | null,
    public finishGameDate: string | null,
  ) {}
}
