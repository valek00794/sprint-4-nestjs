export class CommentatorInfo {
  constructor(
    public userId: string,
    public userLogin: string,
    public email?: string,
  ) {}
}

export class Comment {
  content: string;
  createdAt: string;
  commentatorInfo: CommentatorInfo;
  postId: number;
  id?: number;
}

export class CommentRaw {
  content: string;
  createdAt: string;
  userId: number;
  userLogin: string;
  postId: number;
  id?: number;
}
