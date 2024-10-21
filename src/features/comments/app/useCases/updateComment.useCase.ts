import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CreateCommentInputModel } from '../../api/models/input/comments.input.model';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';
import { CommentType } from '../../domain/comments.types';

export class UpdateCommentCommand {
  constructor(
    public inputModel: CreateCommentInputModel,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdateCommentCommand) {
    const comment = await this.commentsRepository.findCommentById(command.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.commentatorId !== command.userId) {
      throw new ForbiddenException('User not author of comment');
    }
    const updatedComment: CommentType = {
      content: command.inputModel.content,
      commentatorInfo: {
        userId: comment.commentatorId.toString(),
        userLogin: comment.commenator.login,
      },
      createdAt: comment.createdAt,
      postId: comment.postId,
    };
    return await this.commentsRepository.updateComment(updatedComment, command.commentId);
  }
}
