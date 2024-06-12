import { Types } from 'mongoose';
import type { ExtendedLikesInfo } from 'src/features/likes/domain/likes.types';

export class PostView {
  constructor(
    public id: Types.ObjectId,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: Types.ObjectId,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: ExtendedLikesInfo,
  ) {}
}
