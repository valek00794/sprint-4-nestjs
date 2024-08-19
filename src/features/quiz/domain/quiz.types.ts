export class QuestionType {
  constructor(
    public body: string,
    public correctAnswers: [string],
    public updatedAt: string,
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
