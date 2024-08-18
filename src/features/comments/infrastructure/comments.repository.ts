import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CommentType } from '../domain/comments.types';
import { Comment } from './comments.entity';
@Injectable()
export class CommentsRepository {
  constructor(@InjectRepository(Comment) protected commentsRepository: Repository<Comment>) {}
  async createComment(newComment: CommentType): Promise<Comment> {
    console.log(newComment.commentatorInfo.userId, newComment.postId);
    // const comment = this.commentsRepository.create({
    //   content: newComment.content,
    //   createdAt: newComment.createdAt,
    //   commentatorId: Number(newComment.commentatorInfo.userId),
    //   postId: newComment.postId,
    // });
    // const comment = new Comment();
    // comment.content = newComment.content;
    // comment.createdAt = newComment.createdAt;
    // comment.commentatorId = Number(newComment.commentatorInfo.userId);
    // comment.postId = newComment.postId;

    return await this.commentsRepository.save({
      content: newComment.content,
      createdAt: newComment.createdAt,
      commentatorId: Number(newComment.commentatorInfo.userId),
      postId: newComment.postId,
    });
  }
  async updateComment(updateComment: CommentType, commentId: number): Promise<Comment | null> {
    const updatedComment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });
    if (updatedComment) {
      updatedComment.createdAt = updateComment.createdAt;
      updatedComment.content = updateComment.content;
      updatedComment.commentatorId = Number(updateComment.commentatorInfo.userId);
      updatedComment.postId = updateComment.postId;

      await this.commentsRepository.save(updatedComment);
      return updatedComment;
    } else {
      return null;
    }
  }
  async deleteComment(id: number): Promise<boolean> {
    const result = await this.commentsRepository.delete({ id });
    return result.affected === 1 ? true : false;
  }
  async findCommentById(id: number): Promise<Comment | null> {
    return await this.commentsRepository.findOne({
      where: [{ id: id }],
      relations: ['commenator'],
    });
  }
}
