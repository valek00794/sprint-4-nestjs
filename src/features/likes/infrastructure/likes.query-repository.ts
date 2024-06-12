import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import {
  ExtendedLikesInfo,
  LikeStatus,
  LikesInfoView,
  NewestLike,
  LikesInfo,
} from '../domain/likes.types';
import { Like, LikeDocument } from './likes.schema';

@Injectable()
export class LikesQueryRepository {
  constructor(@InjectModel(Like.name) private LikeStatusModel: Model<LikeDocument>) {}
  async getLikesInfo(parrentId: string): Promise<LikesInfo[]> {
    return await this.LikeStatusModel.find({ parrentId });
  }
  mapLikesInfo(likesInfo: LikesInfo[], userId?: string): LikesInfoView {
    const likesInfoView = new LikesInfoView(
      likesInfo.filter((like) => like.status === LikeStatus.Like).length,
      likesInfo.filter((like) => like.status === LikeStatus.Dislike).length,
      likesInfo.find((like) => like.authorId.toString() === userId)?.status || LikeStatus.None,
    );
    return likesInfoView;
  }

  mapExtendedLikesInfo(likesInfo: LikesInfo[], userId?: string): ExtendedLikesInfo {
    const lastLikesCount = 3;
    const newestLikes = likesInfo
      .filter((like) => like.status === LikeStatus.Like)
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      .slice(0, lastLikesCount);
    const newestLikesView = newestLikes.map(
      (like) => new NewestLike(like.addedAt, like.authorId.toString(), like.authorLogin),
    );
    const mappedLikesInfo = this.mapLikesInfo(likesInfo, userId);

    return new ExtendedLikesInfo(
      mappedLikesInfo.likesCount,
      mappedLikesInfo.dislikesCount,
      mappedLikesInfo.myStatus,
      newestLikesView,
    );
  }
}
