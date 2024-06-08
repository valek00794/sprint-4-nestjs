import { IsNotEmpty } from 'class-validator';
import type { LikeStatus } from '../../domain/likes.types';

export class LikeStatusInputModel {
  @IsNotEmpty()
  likeStatus: LikeStatus;
}
