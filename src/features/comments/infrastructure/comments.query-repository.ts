import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { LikeStatus, type LikesInfoView } from 'src/features/likes/domain/likes.types';
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
      .leftJoinAndSelect('comment.likes', 'like')
      .where('comment.postId = :postId', { postId })
      .orderBy(`comment.${sanitizationQuery.sortBy}`, sanitizationQuery.sortDirection)
      .take(sanitizationQuery.pageSize)
      .skip(offset)
      .getManyAndCount();

    const [comments, count] = await query;
    const commentsItems = comments.map((comment) => {
      const mapedlikesInfo = this.likesQueryRepository.mapLikesInfo(comment.likes, Number(userId));
      return this.mapToOutput(comment, mapedlikesInfo);
    });

    return new Paginator<CommentOutputModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(count),
      commentsItems,
    );
  }
  async findCommentById(id: number): Promise<Comment | null> {
    const comment = await this.commentsRepository.findOne({
      where: [{ id: id }],
      relations: {
        commenator: {
          banInfo: true,
        },
        likes: {
          author: { banInfo: true },
        },
      },
    });
    if (!comment) {
      return null;
    }
    return comment;
  }

  mapToOutput(comment: Comment, likesInfo?: LikesInfoView): CommentOutputModel {
    return new CommentOutputModel(
      comment.id!.toString(),
      comment.content,
      {
        userId: comment.commenator.id.toString(),
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
