import { LikeStatus } from '../domain/likes.types';

export class LikesEntity {
  parrentId: number;
  authorId: number;
  status: LikeStatus;
  addedAt: Date;
  authorLogin: string;
  id: number;
}
