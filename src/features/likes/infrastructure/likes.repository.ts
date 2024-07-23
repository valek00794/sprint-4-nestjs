import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { LikesParrentNames } from '../domain/likes.types';
import { PostsLike } from './postslikes.entity';
import { CommentsLike } from './commentsLikes.entity';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectRepository(PostsLike) protected postsLikesRepository: Repository<PostsLike>,
    @InjectRepository(CommentsLike) protected commentsLikesRepository: Repository<CommentsLike>,
  ) {}
  async updateLikeInfo(
    parrentId: number,
    parrentName: LikesParrentNames,
    authorId: number,
    status: string,
  ): Promise<number | null> {
    let qb;
    let parrentField;
    if (parrentName === LikesParrentNames.Post) {
      qb = this.postsLikesRepository.createQueryBuilder('l');
      parrentField = 'postId';
    }
    if (parrentName === LikesParrentNames.Comment) {
      qb = this.commentsLikesRepository.createQueryBuilder('l');
      parrentField = 'commentId';
    }
    const result = await qb
      .insert()
      .values({
        status: status,
        [parrentField]: parrentId,
        authorId: authorId,
        addedAt: new Date().toISOString(),
      })
      .onConflict(
        `("authorId", "${parrentField}") DO UPDATE SET
        "status" = excluded."status",
        "addedAt" = excluded."addedAt"`,
      )
      .execute();
    return result;
  }
  async deleteLikeInfo(
    parrentId: number,
    authorId: number,
    parrentName: LikesParrentNames,
  ): Promise<boolean> {
    let qb;
    let parrentField;
    if (parrentName === LikesParrentNames.Post) {
      qb = this.postsLikesRepository.createQueryBuilder('l');
      parrentField = 'postId';
    }
    if (parrentName === LikesParrentNames.Comment) {
      qb = this.commentsLikesRepository.createQueryBuilder('l');
      parrentField = 'commentId';
    }
    const result = await qb
      .delete()
      .where(`${parrentField} = :parrentId`, { parrentId })
      .andWhere('authorId = :authorId', { authorId })
      .execute();

    return result.affected > 0;
  }

  async getLikeInfo(parrentId: number, authorId: number, parrentName: LikesParrentNames) {
    let qb;
    let parrentField;
    if (parrentName === LikesParrentNames.Post) {
      qb = this.postsLikesRepository.createQueryBuilder('l');
      parrentField = 'postId';
    }
    if (parrentName === LikesParrentNames.Comment) {
      qb = this.commentsLikesRepository.createQueryBuilder('l');
      parrentField = 'commentId';
    }
    const likesInfo = await qb
      .select([
        'l.id',
        'l.status',
        `${parrentField}`,
        'l.authorId',
        'l.addedAt',
        'u.login" as "authorLogin"',
      ])
      .leftJoin('users', 'u', 'l."authorId" = u."Id"')
      .where(`${parrentField} = :parrentId`, { parrentId })
      .andWhere('l."authorId" = :authorId', { authorId })
      .getRawMany();

    return likesInfo.length !== 0 ? likesInfo : null;
  }
}
