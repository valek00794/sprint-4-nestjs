import { Injectable } from '@nestjs/common';
import { LikesRepository } from '../infrastructure/likeS.repository';
import { LikeStatus, type LikesInfo } from '../domain/likes.types';
import type { LikeStatusInputModel } from '../api/models/likes.input.model';
@Injectable()
export class LikesService {
  constructor(protected likesRepository: LikesRepository) {}

  async changeLikeStatus(
    parrentId: string,
    inputModel: LikeStatusInputModel,
    userId: string,
    authorId: string,
  ): Promise<LikesInfo | null> {
    if (inputModel.likeStatus === LikeStatus.None) {
      return await this.likesRepository.deleteLikeInfo(parrentId, userId);
    }
    return await this.likesRepository.updateLikeInfo(
      parrentId,
      userId,
      authorId,
      inputModel.likeStatus,
    );
  }
}
