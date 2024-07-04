import { Injectable, NotFoundException } from '@nestjs/common';

import { LikeStatus, type LikesInfoView } from 'src/features/likes/domain/likes.types';
import { CommentOutputModel } from '../api/models/output/comments.output.model';
import type { SearchQueryParametersType } from 'src/features/domain/query.types';
import { Paginator } from 'src/features/domain/result.types';
import { getSanitizationQuery } from 'src/features/utils';
import { LikesQueryRepository } from 'src/features/likes/infrastructure/likes.query-repository';

@Injectable()
export class CommentsQueryRepository {
  // constructor(
  //   @InjectModel(Comment.name) private CommentsModel: Model<CommentDocument>,
  //   protected likesQueryRepository: LikesQueryRepository,
  // ) {}
  // async getComments(
  //   postId: string,
  //   query?: SearchQueryParametersType,
  //   userId?: string,
  // ): Promise<Paginator<CommentOutputModel[]>> {
  //   const sanitizationQuery = getSanitizationQuery(query);
  //   let findOptions = {};
  //   if (postId) {
  //     findOptions = { postId: stringToObjectId(postId) };
  //   }
  //   const comments = await this.CommentsModel.find(findOptions)
  //     .sort({ [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection })
  //     .skip((sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize)
  //     .limit(sanitizationQuery.pageSize);
  //   const commentsCount = await this.CommentsModel.countDocuments(findOptions);
  //   const commentsItems = await Promise.all(
  //     comments.map(async (comment) => {
  //       const likesInfo = await this.likesQueryRepository.getLikesInfo(comment.id);
  //       const mapedlikesInfo = this.likesQueryRepository.mapLikesInfo(likesInfo!, userId);
  //       return this.mapToOutput(comment, mapedlikesInfo);
  //     }),
  //   );
  //   return new Paginator<CommentOutputModel[]>(
  //     sanitizationQuery.pageNumber,
  //     sanitizationQuery.pageSize,
  //     commentsCount,
  //     commentsItems,
  //   );
  // }
  // async findComment(id: string, userId?: string) {
  //   if (!isValidMongoId(id)) {
  //     throw new NotFoundException('Invalid ID');
  //   }
  //   const comment = await this.CommentsModel.findById(id);
  //   if (!comment) {
  //     throw new NotFoundException('Comment not found');
  //   }
  //   let outputComment;
  //   if (comment) {
  //     const likesInfo = await this.likesQueryRepository.getLikesInfo(id);
  //     const mapedlikesInfo = this.likesQueryRepository.mapLikesInfo(likesInfo!, userId);
  //     outputComment = this.mapToOutput(comment, mapedlikesInfo);
  //   }
  //   return comment && outputComment ? outputComment : false;
  // }
  // mapToOutput(comment: CommentDocument, likesInfo?: LikesInfoView): CommentOutputModel {
  //   return new CommentOutputModel(
  //     comment._id!,
  //     comment.content,
  //     {
  //       userId: comment.commentatorInfo.userId,
  //       userLogin: comment.commentatorInfo.userLogin,
  //     },
  //     comment.createdAt,
  //     {
  //       likesCount: likesInfo?.likesCount || 0,
  //       dislikesCount: likesInfo?.dislikesCount || 0,
  //       myStatus: likesInfo?.myStatus || LikeStatus.None,
  //     },
  //   );
  // }
}
