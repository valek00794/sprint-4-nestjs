import { Injectable } from '@nestjs/common';

import { ExtendedLikesInfo, LikeStatus, LikesInfoView, NewestLike } from '../domain/likes.types';

import { PostsLike } from './postslikes.entity';
import { CommentsLike } from './commentsLikes.entity';
@Injectable()
export class LikesQueryRepository {
  constructor() {}
  mapLikesInfo(likesInfo: PostsLike[] | CommentsLike[], userId: number | null): LikesInfoView {
    const likesInfoWuthoutBanned = likesInfo.filter((like) => !like.author.banInfo);
    const likesInfoView = new LikesInfoView(
      likesInfoWuthoutBanned.filter((like) => like.status === LikeStatus.Like).length,
      likesInfoWuthoutBanned.filter((like) => like.status === LikeStatus.Dislike).length,
      likesInfoWuthoutBanned.find((like) => like.authorId === userId)?.status || LikeStatus.None,
    );
    return likesInfoView;
  }

  mapExtendedLikesInfo(likesInfo: PostsLike[], userId: number | null): ExtendedLikesInfo {
    const lastLikesCount = 3;
    const newestLikes = likesInfo
      .filter((like) => !like.author.banInfo)
      .filter((like) => like.status === LikeStatus.Like)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, lastLikesCount);
    const newestLikesView = newestLikes.map(
      (like) => new NewestLike(like.addedAt, like.author.id.toString(), like.author.login),
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
