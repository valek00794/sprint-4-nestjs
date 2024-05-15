import { Types } from 'mongoose';
import { ExtendedLikesInfo } from 'src/features/likes/models/output/likes.output.model';

export class PostView {
  constructor(
    public id: Types.ObjectId,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: Types.ObjectId,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo?: ExtendedLikesInfo,
  ) {}
}
