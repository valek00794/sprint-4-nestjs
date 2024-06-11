import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import type { CommentsDocument } from '../infrastructure/comments.schema';
import { CreateCommentModel } from '../api/models/input/comments.input.model';
import { CommentatorInfo } from '../domain/comments.types';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';

@Injectable()
export class CommentsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
  ) {}

  async createComment(
    inputModel: CreateCommentModel,
    postId: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentsDocument> {
    const post = await this.postsRepository.findPost(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const commentatorInfo = new CommentatorInfo(userId, userLogin);
    const newComment = {
      content: inputModel.content,
      createdAt: new Date().toISOString(),
      commentatorInfo: {
        ...commentatorInfo,
      },
      postId: new Types.ObjectId(postId),
    };
    return await this.commentsRepository.createComment(newComment);
  }

  async updateComment(
    inputModel: CreateCommentModel,
    comment: CommentsDocument,
    userId: string,
    userLogin: string,
  ): Promise<boolean> {
    const commentatorInfo = new CommentatorInfo(userId, userLogin);
    if (
      comment.commentatorInfo.userId !== commentatorInfo.userId &&
      comment.commentatorInfo.userLogin !== commentatorInfo.userLogin
    ) {
      throw new ForbiddenException('User not author of comment');
    }
    const updatedComment = {
      content: inputModel.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      postId: comment.postId,
    };
    return await this.commentsRepository.updateComment(updatedComment, comment.id.toString());
  }

  async deleteComment(comment: CommentsDocument, userId: string, userLogin: string): Promise<true> {
    const commentatorInfo = new CommentatorInfo(userId, userLogin);
    if (
      comment.commentatorInfo.userId !== commentatorInfo.userId &&
      comment.commentatorInfo.userLogin !== commentatorInfo.userLogin
    ) {
      throw new ForbiddenException('User not author of comment');
    }
    const deleteResult = await this.commentsRepository.deleteComment(comment.id.toString());
    if (!deleteResult) throw new NotFoundException();
    return true;
  }
}
