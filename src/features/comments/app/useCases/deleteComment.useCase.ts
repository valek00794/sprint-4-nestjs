import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CommentatorInfo } from '../../domain/comments.types';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';
import { CommentDocument } from '../../infrastructure/comments.schema';

export class DeleteCommentCommand {
  constructor(
    public comment: CommentDocument,
    public userId: string,
    public userLogin: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: DeleteCommentCommand) {
    const commentatorInfo = new CommentatorInfo(command.userId, command.userLogin);
    if (
      command.comment.commentatorInfo.userId !== commentatorInfo.userId &&
      command.comment.commentatorInfo.userLogin !== commentatorInfo.userLogin
    ) {
      throw new ForbiddenException('User not author of comment');
    }
    const deleteResult = await this.commentsRepository.deleteComment(command.comment.id.toString());
    if (!deleteResult) throw new NotFoundException();
    return true;
  }
}
