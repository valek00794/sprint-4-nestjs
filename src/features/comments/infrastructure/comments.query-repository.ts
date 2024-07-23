import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import {
  LikeStatus,
  LikesParrentNames,
  type LikesInfoView,
} from 'src/features/likes/domain/likes.types';
import { CommentOutputModel } from '../api/models/output/comments.output.model';
import type { SearchQueryParametersType } from 'src/features/domain/query.types';
import { Paginator } from 'src/features/domain/result.types';
import { getSanitizationQuery } from 'src/features/utils';
import { LikesQueryRepository } from 'src/features/likes/infrastructure/likes.query-repository';
import { Comment } from './comments.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected likesQueryRepository: LikesQueryRepository,
    @InjectRepository(Comment) protected commentsRepository: Repository<Comment>,
  ) {}
  async getComments(
    postId: string,
    queryString?: SearchQueryParametersType,
    userId?: string,
  ): Promise<Paginator<CommentOutputModel[]>> {
    const sanitizationQuery = getSanitizationQuery(queryString);

    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;
    const qb = this.commentsRepository.createQueryBuilder('comment');
    const query = qb
      .leftJoinAndSelect('comment.commenator', 'commenator')
      .where('comment.postId = :postId', { postId })
      .orderBy(`comment.${sanitizationQuery.sortBy}`, sanitizationQuery.sortDirection)
      .take(sanitizationQuery.pageSize)
      .skip(offset)
      .getManyAndCount();

    const [comments, count] = await query;

    const commentsItems = await Promise.all(
      comments.map(async (comment) => {
        const likesInfo = await this.likesQueryRepository.getLikesInfo(
          Number(comment.id),
          LikesParrentNames.Comment,
        );
        const mapedlikesInfo = this.likesQueryRepository.mapLikesInfo(likesInfo!, Number(userId));
        return this.mapToOutput(comment, mapedlikesInfo);
      }),
    );
    return new Paginator<CommentOutputModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(count),
      commentsItems,
    );
  }
  async findCommentById(id: number, userId?: number): Promise<CommentOutputModel> {
    const comment = await this.commentsRepository.findOne({
      where: [{ id: id }],
      relations: ['commenator'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const likesInfo = await this.likesQueryRepository.getLikesInfo(id, LikesParrentNames.Comment);
    const mapedlikesInfo = this.likesQueryRepository.mapLikesInfo(likesInfo!, userId);
    return this.mapToOutput(comment, mapedlikesInfo);
  }

  mapToOutput(comment: Comment, likesInfo?: LikesInfoView): CommentOutputModel {
    return new CommentOutputModel(
      comment.id!.toString(),
      comment.content,
      {
        userId: comment.commentatorId.toString(),
        userLogin: comment.commenator.login,
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
