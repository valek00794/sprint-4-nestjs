export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export enum LikesParrentNames {
  Post = 'postsLikes',
  Comment = 'commentsLikes',
}
export class LikesInfoView {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: LikeStatus,
  ) {}
}

export class NewestLike {
  constructor(
    public addedAt: string,
    public userId: string,
    public login: string,
  ) {}
}

export class ExtendedLikesInfo extends LikesInfoView {
  constructor(
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
    public newestLikes: NewestLike[],
  ) {
    super(likesCount, dislikesCount, myStatus);
  }
}

export class LikeType {
  parrentId: number;
  authorId: number;
  status: LikeStatus;
  addedAt: string;
  authorLogin: string;
  id: number;
}
