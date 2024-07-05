import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import {
  ExtendedLikesInfo,
  LikeStatus,
  LikesInfoView,
  NewestLike,
  LikesInfo,
} from '../domain/likes.types';
@Injectable()
export class LikesQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getLikesInfo(parrentId: number): Promise<LikesInfo[]> {
    const query = `
      SELECT  l."Id" as "id",  l."Status" as "status", l."ParrentId" as "parrentId", l."AuthorId" as "authorId", l."AddedAt" as "addedAt",
        u."Login" as "authorLogin"
       FROM "likes" l
       JOIN "users" u ON l."AuthorId" = u."Id"
       WHERE "ParrentId" = $1;
     `;
    return await this.dataSource.query<LikesInfo[]>(query, [parrentId]);
  }

  mapLikesInfo(likesInfo: LikesInfo[], userId?: number): LikesInfoView {
    const likesInfoView = new LikesInfoView(
      likesInfo.filter((like) => like.status === LikeStatus.Like).length,
      likesInfo.filter((like) => like.status === LikeStatus.Dislike).length,
      likesInfo.find((like) => like.authorId === userId)?.status || LikeStatus.None,
    );
    return likesInfoView;
  }

  mapExtendedLikesInfo(likesInfo: LikesInfo[], userId?: number): ExtendedLikesInfo {
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
