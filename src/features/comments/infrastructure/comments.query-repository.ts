import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { LikeStatus, LikesInfoView } from 'src/features/likes/domain/likes.types';
import { CommentOutputModel } from '../api/models/output/comments.output.model';
import type { SearchQueryParametersType } from 'src/features/domain/query.types';
import { Paginator } from 'src/features/domain/result.types';
import { getSanitizationQuery } from 'src/features/utils';
import { LikesQueryRepository } from 'src/features/likes/infrastructure/likes.query-repository';
import { Comment } from './comments.entity';
import { PostInfoViewModel } from 'src/features/posts/api/models/output/posts.output.model';
import { Post } from 'src/features/posts/infrastructure/posts.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected likesQueryRepository: LikesQueryRepository,
    @InjectRepository(Comment) protected commentsRepository: Repository<Comment>,
  ) {}
  async getComments(
    postId?: string,
    queryString?: SearchQueryParametersType,
    userId?: string,
  ): Promise<Paginator<CommentOutputModel[]>> {
    const sanitizationQuery = getSanitizationQuery(queryString);

    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;

    const qb = this.commentsRepository.createQueryBuilder('comment');
    const query = qb
      .leftJoinAndSelect('comment.commenator', 'commenator')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('post.blog', 'blog')
      .leftJoinAndSelect('blog.blogOwnerInfo', 'blogOwnerInfo')
      .leftJoinAndSelect('comment.likes', 'like')
      .orderBy(`comment.${sanitizationQuery.sortBy}`, sanitizationQuery.sortDirection)
      .take(sanitizationQuery.pageSize)
      .skip(offset);

    if (postId) {
      qb.where('comment.postId = :postId', { postId });
    }

    if (!postId && userId) {
      qb.where('blogOwnerInfo.id = :userId', { userId });
    }
    const [comments, count] = await query.getManyAndCount();

    const commentsItems = comments.map((comment) => {
      const mapedlikesInfo = this.likesQueryRepository.mapLikesInfo(comment.likes, userId);
      if (!postId && userId) {
        return this.mapToOutput(comment, mapedlikesInfo, comment.post);
      }
      return this.mapToOutput(comment, mapedlikesInfo);
    });
    return new Paginator<CommentOutputModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      count,
      commentsItems,
    );
  }
  async findCommentById(id: string): Promise<Comment | null> {
    const comment = await this.commentsRepository.findOne({
      where: [{ id }],
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

  mapToOutput(comment: Comment, likesInfo?: LikesInfoView, post?: Post): CommentOutputModel {
    return new CommentOutputModel(
      comment.id,
      comment.content,
      {
        userId: comment.commenator.id,
        userLogin: comment.commenator.login,
      },
      comment.createdAt,
      {
        likesCount: likesInfo?.likesCount || 0,
        dislikesCount: likesInfo?.dislikesCount || 0,
        myStatus: likesInfo?.myStatus || LikeStatus.None,
      },
      post ? new PostInfoViewModel(post.id, post.title, post.blogId, post.blog.name) : undefined,
    );
  }
}
