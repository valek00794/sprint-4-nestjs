import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CommentType } from '../domain/comments.types';
import { Comment } from './comments.entity';
@Injectable()
export class CommentsRepository {
  constructor(@InjectRepository(Comment) protected commentsRepository: Repository<Comment>) {}
  async createComment(newComment: CommentType): Promise<string> {
    const comment = new Comment();
    comment.content = newComment.content;
    comment.createdAt = newComment.createdAt;
    comment.commentatorId = newComment.commentatorInfo.userId;
    comment.postId = newComment.postId;

    await this.commentsRepository.save(comment);
    return comment.id;
  }
  async updateComment(updateComment: CommentType, commentId: string): Promise<Comment | null> {
    const updatedComment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });
    if (updatedComment) {
      updatedComment.createdAt = updateComment.createdAt;
      updatedComment.content = updateComment.content;
      updatedComment.commentatorId = updateComment.commentatorInfo.userId;
      updatedComment.postId = updateComment.postId;

      await this.commentsRepository.save(updatedComment);
      return updatedComment;
    } else {
      return null;
    }
  }
  async deleteComment(id: string): Promise<boolean> {
    const result = await this.commentsRepository.delete({ id });
    return result.affected === 1 ? true : false;
  }
  async findCommentById(id: string): Promise<Comment | null> {
    return await this.commentsRepository.findOne({
      where: [{ id: id }],
      relations: ['commenator'],
    });
  }
}
