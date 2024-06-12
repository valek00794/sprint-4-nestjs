import { IsDefined, IsIn, IsOptional } from 'class-validator';
import { LikeStatus } from '../../domain/likes.types';
export class LikeStatusInputModel {
  @IsDefined()
  @IsIn(Object.values(LikeStatus))
  @IsOptional()
  likeStatus: LikeStatus;
}
