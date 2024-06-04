export class FieldError {
  constructor(
    public message: string,
    public field: string,
  ) {}
}

export type APIErrorResult = {
  errorsMessages: FieldError[];
};
