export class CommentatorInfo {
  constructor(
    public userId: string,
    public userLogin: string,
    public email?: string,
  ) {}
}

export class CommentType {
  content: string;
  createdAt: string;
  commentatorInfo: CommentatorInfo;
  postId: number;
  id?: number;
}
