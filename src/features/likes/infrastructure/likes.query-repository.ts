import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  ExtendedLikesInfo,
  LikeStatus,
  LikesInfoView,
  NewestLike,
  LikesParrentNames,
  LikeType,
} from '../domain/likes.types';

import { PostsLike } from './postslikes.entity';
import { CommentsLike } from './commentsLikes.entity';
@Injectable()
export class LikesQueryRepository {
  constructor(
    @InjectRepository(PostsLike) protected postsLikesRepository: Repository<PostsLike>,
    @InjectRepository(CommentsLike) protected commentsLikesRepository: Repository<CommentsLike>,
  ) {}
  async getLikesInfo(parrentId: number, parrentName: LikesParrentNames): Promise<LikeType[]> {
    let qb;
    let parrentField;
    if (parrentName === LikesParrentNames.Post) {
      qb = this.postsLikesRepository.createQueryBuilder('l');
      parrentField = 'l.postId';
    }
    if (parrentName === LikesParrentNames.Comment) {
      qb = this.commentsLikesRepository.createQueryBuilder('l');
      parrentField = 'l.commentId';
    }
    const likes = await qb
      .select(['l.id, l.status, l.authorId, l.addedAt, u.login as "authorLogin"'])
      .innerJoinAndSelect('l.author', 'u')
      .where(`${parrentField} = :parrentId`, { parrentId })
      .getRawMany();
    return likes;
  }

  mapLikesInfo(likesInfo: LikeType[], userId?: number): LikesInfoView {
    const likesInfoView = new LikesInfoView(
      likesInfo.filter((like) => like.status === LikeStatus.Like).length,
      likesInfo.filter((like) => like.status === LikeStatus.Dislike).length,
      likesInfo.find((like) => like.authorId === userId)?.status || LikeStatus.None,
    );
    return likesInfoView;
  }

  mapExtendedLikesInfo(likesInfo: LikeType[], userId?: number): ExtendedLikesInfo {
    const lastLikesCount = 3;
    const newestLikes = likesInfo
      .filter((like) => like.status === LikeStatus.Like)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
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
