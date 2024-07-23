import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const commentId = Number(command.commentId);
    if (isNaN(commentId)) {
      throw new NotFoundException('Comment not found');
    }
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.commentatorId !== Number(command.userId)) {
      throw new ForbiddenException('User not author of comment');
    }
    const deleteResult = await this.commentsRepository.deleteComment(commentId);
    if (!deleteResult) throw new NotFoundException();
    return true;
  }
}
