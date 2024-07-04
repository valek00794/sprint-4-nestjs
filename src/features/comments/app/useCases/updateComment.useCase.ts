import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CreateCommentInputModel } from '../../api/models/input/comments.input.model';
import { CommentatorInfo } from '../../domain/comments.types';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';
import { CommentsEntity } from '../../infrastructure/comments.entity';

export class UpdateCommentCommand {
  constructor(
    public inputModel: CreateCommentInputModel,
    public commentId: string,
    public userId: string,
    public userLogin: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdateCommentCommand) {
    const commentId = Number(command.commentId);
    if (isNaN(commentId)) {
      throw new NotFoundException('Comment not found');
    }
    const comment = await this.commentsRepository.findComment(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const commentatorInfo = new CommentatorInfo(commentId, command.userLogin);
    if (
      comment.userId !== commentatorInfo.userId &&
      comment.userLogin !== commentatorInfo.userLogin
    ) {
      throw new ForbiddenException('User not author of comment');
    }
    const updatedComment = {
      content: command.inputModel.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      postId: comment.postId,
    };
    return await this.commentsRepository.updateComment(updatedComment, commentId);
  }
}
