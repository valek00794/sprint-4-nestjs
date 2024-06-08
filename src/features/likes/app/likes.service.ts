import { Injectable } from '@nestjs/common';
import { LikesRepository } from '../infrastructure/likeS.repository';
import { LikeStatus, type LikesInfo } from '../domain/likes.types';

@Injectable()
export class LikesService {
  constructor(protected likesRepository: LikesRepository) {}

  async changeLikeStatus(
    parrentId: string,
    likeStatus: LikeStatus,
    userId: string,
    authorId: string,
  ): Promise<LikesInfo | null> {
    if (likeStatus === LikeStatus.None) {
      return await this.likesRepository.deleteLikeInfo(parrentId, userId);
    }
    return await this.likesRepository.updateLikeInfo(parrentId, userId, authorId, likeStatus);
  }
}
