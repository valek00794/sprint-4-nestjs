import { Injectable } from '@nestjs/common';

import { ExtendedLikesInfo, LikeStatus, LikesInfoView, NewestLike } from '../domain/likes.types';

import { PostsLike } from './postslikes.entity';
import { CommentsLike } from './commentsLikes.entity';
@Injectable()
export class LikesQueryRepository {
  constructor() {}
  mapLikesInfo(likesInfo: PostsLike[] | CommentsLike[], userId?: number): LikesInfoView {
    const likesInfoView = new LikesInfoView(
      likesInfo.filter((like) => like.status === LikeStatus.Like).length,
      likesInfo.filter((like) => like.status === LikeStatus.Dislike).length,
      likesInfo.find((like) => like.authorId === userId)?.status || LikeStatus.None,
    );
    return likesInfoView;
  }

  mapExtendedLikesInfo(likesInfo: PostsLike[], userId?: number): ExtendedLikesInfo {
    const lastLikesCount = 3;
    const newestLikes = likesInfo
      .filter((like) => like.status === LikeStatus.Like)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, lastLikesCount);
    const newestLikesView = newestLikes.map(
      (like) => new NewestLike(like.addedAt, like.authorId.toString(), like.author.login),
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
