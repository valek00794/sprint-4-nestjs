import { ObjectId, WithId } from 'mongodb';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class LikesInfo {
  constructor(
    public parrentId: ObjectId,
    public authorId: ObjectId,
    public authorLogin: string,
    public status: LikeStatus,
    public addedAt: Date,
  ) {}
}

export type LikesInfoDBType = WithId<LikesInfo>;

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
