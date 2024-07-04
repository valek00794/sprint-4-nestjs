import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { LikeStatus, type LikesInfoView } from 'src/features/likes/domain/likes.types';
import { CommentOutputModel } from '../api/models/output/comments.output.model';
import type { SearchQueryParametersType } from 'src/features/domain/query.types';
import { Paginator } from 'src/features/domain/result.types';
import { getSanitizationQuery } from 'src/features/utils';
import { LikesQueryRepository } from 'src/features/likes/infrastructure/likes.query-repository';
import { CommentRaw } from '../domain/comments.types';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected likesQueryRepository: LikesQueryRepository,
  ) {}
  async getComments(
    postId: string,
    query?: SearchQueryParametersType,
    userId?: string,
  ): Promise<Paginator<CommentOutputModel[]>> {
    const sanitizationQuery = getSanitizationQuery(query);

    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;
    const queryString = `
      SELECT  c."Id" as "id",  c."Content" as "content",  c."CommentatorId" as "userId", c."PostId" as "postId",  c."CreatedAt" as "createdAt",
        u."Login" as "userLogin"
      FROM "comments" c
      JOIN "users" u ON c."CommentatorId" = u."Id"
      WHERE c."PostId" = $1
      ORDER BY "${sanitizationQuery.sortBy}"  ${sanitizationQuery.sortDirection}
      LIMIT ${sanitizationQuery.pageSize} 
      OFFSET ${offset};
    `;
    const comments = await this.dataSource.query<CommentRaw[]>(queryString, [postId]);
    const countQuery = `
    SELECT COUNT(*)
    FROM "comments" c
    WHERE c."PostId" = $1; 
  `;
    const commentsCount = await this.dataSource.query(countQuery, [postId]);
    const commentsItems = await Promise.all(
      comments.map(async (comment) => {
        // const likesInfo = await this.likesQueryRepository.getLikesInfo(comment.id);
        // const mapedlikesInfo = this.likesQueryRepository.mapLikesInfo(likesInfo!, userId);
        return this.mapToOutput(comment);
      }),
    );
    return new Paginator<CommentOutputModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(commentsCount[0]?.count || 0),
      commentsItems,
    );
  }
  async findComment(id: string, userId?: string): Promise<CommentOutputModel> {
    if (isNaN(Number(id))) {
      throw new NotFoundException('Comment not found');
    }
    const query = `
      SELECT  c."Id" as "id",  c."Content" as "content",  c."CommentatorId" as "userId",  c."PostId" as "postId",  c."CreatedAt" as "createdAt", 
        u."Login" as "userLogin"
       FROM "comments" c
       JOIN "users" u ON c."CommentatorId" = u."Id"
       WHERE c."Id" = $1;
     `;
    const comment = await this.dataSource.query<CommentRaw[]>(query, [id]);
    if (comment.length === 0) {
      throw new NotFoundException('Comment not found');
    }
    // const likesInfo = await this.likesQueryRepository.getLikesInfo(id);
    // const mapedlikesInfo = this.likesQueryRepository.mapLikesInfo(likesInfo!, userId);
    return this.mapToOutput(comment[0]);
  }

  mapToOutput(comment: CommentRaw, likesInfo?: LikesInfoView): CommentOutputModel {
    return new CommentOutputModel(
      comment.id!,
      comment.content,
      {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      comment.createdAt,
      {
        likesCount: likesInfo?.likesCount || 0,
        dislikesCount: likesInfo?.dislikesCount || 0,
        myStatus: likesInfo?.myStatus || LikeStatus.None,
      },
    );
  }
}
