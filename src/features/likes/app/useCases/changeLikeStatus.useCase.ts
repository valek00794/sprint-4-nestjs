import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikesRepository } from '../../infrastructure/likeS.repository';
import { LikesParrentNames, LikeStatus } from '../../domain/likes.types';
import type { LikeStatusInputModel } from '../../api/models/likes.input.model';
import { CommentsRepository } from 'src/features/comments/infrastructure/comments.repository';
import { NotFoundException } from '@nestjs/common';

export class ChangeLikeStatusCommand {
  constructor(
    public parrentId: string,
    public parrentName: LikesParrentNames,
    public userId: string,
    public inputModel: LikeStatusInputModel,
  ) {}
}

@CommandHandler(ChangeLikeStatusCommand)
export class ChangeLikeStatusUseCase implements ICommandHandler<ChangeLikeStatusCommand> {
  constructor(
    protected likesRepository: LikesRepository,
    protected commentsRepository: CommentsRepository,
  ) {}

  async execute(command: ChangeLikeStatusCommand) {
    const parrentId = Number(command.parrentId);
    const userId = Number(command.userId);
    if (isNaN(userId)) {
      throw new NotFoundException('UserId not found');
    }
    if (command.inputModel.likeStatus === LikeStatus.None) {
      return await this.likesRepository.deleteLikeInfo(parrentId, userId, command.parrentName);
    }
    return await this.likesRepository.updateLikeInfo(
      parrentId,
      command.parrentName,
      userId,
      command.inputModel.likeStatus,
    );
  }
}
