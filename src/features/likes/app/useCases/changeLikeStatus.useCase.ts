import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikesRepository } from '../../infrastructure/likeS.repository';
import { LikeStatus } from '../../domain/likes.types';
import type { LikeStatusInputModel } from '../../api/models/likes.input.model';

export class ChangeLikeStatusCommand {
  constructor(
    public parrentId: string,
    public inputModel: LikeStatusInputModel,
    public userId: string,
    public authorId: string,
  ) {}
}

@CommandHandler(ChangeLikeStatusCommand)
export class ChangeLikeStatusUseCase implements ICommandHandler<ChangeLikeStatusCommand> {
  constructor(protected likesRepository: LikesRepository) {}

  async execute(command: ChangeLikeStatusCommand) {
    // if (command.inputModel.likeStatus === LikeStatus.None) {
    //   return await this.likesRepository.deleteLikeInfo(command.parrentId, command.userId);
    // }
    // return await this.likesRepository.updateLikeInfo(
    //   command.parrentId,
    //   command.userId,
    //   command.authorId,
    //   command.inputModel.likeStatus,
    // );
    // CREATE TABLE "blogs" (
    //   "Name" SERIAL PRIMARY KEY,
    //   "Description" VARCHAR(255) NOT NULL,
    //   "WebsiteUrl" VARCHAR(255) NOT NULL,
    //   "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    //   "IsMembership"  BOOLEAN NOT NULL,
    // );
    // FOREIGN KEY ("UserId") REFERENCES users("Id") ON DELETE CASCADE
    return command;
  }
}
