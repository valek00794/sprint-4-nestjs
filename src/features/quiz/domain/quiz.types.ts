export class QuestionType {
  constructor(
    public body: string,
    public correctAnswers: [string],
    public updatedAt: string | null,
    public createdAt?: string,
    public published?: boolean,
  ) {}
}

export class ChangePublishQuestionStatusType {
  constructor(
    public updatedAt: string,
    public published: boolean,
  ) {}
}

export enum AnswerStatuses {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

export enum GameStatuses {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}
