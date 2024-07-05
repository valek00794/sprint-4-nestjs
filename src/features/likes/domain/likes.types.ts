export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class LikesInfo {
  constructor(
    public parrentId: number,
    public authorId: number,
    public authorLogin: string,
    public status: LikeStatus,
    public addedAt: Date,
  ) {}
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
    public addedAt: Date,
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
