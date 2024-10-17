import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';
import { CommentOutputModel } from '../../api/models/output/comments.output.model';
import { LikesQueryRepository } from 'src/features/likes/infrastructure/likes.query-repository';

export class GetCommentCommand {
  constructor(
    public id: string,
    public userId?: string,
  ) {}
}

@CommandHandler(GetCommentCommand)
export class GetCommentUseCase implements ICommandHandler<GetCommentCommand> {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute(command: GetCommentCommand): Promise<CommentOutputModel> {
    const comment = await this.commentsQueryRepository.findCommentById(command.id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.commenator.banInfo && comment.commenator.banInfo?.isBanned) {
      throw new NotFoundException('Comment not found');
    }
    const mapedlikesInfo = this.likesQueryRepository.mapLikesInfo(comment.likes, command.userId);
    return this.commentsQueryRepository.mapToOutput(comment, mapedlikesInfo);
  }
}
