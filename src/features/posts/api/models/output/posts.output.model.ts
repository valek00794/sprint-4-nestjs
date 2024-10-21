import { ImageInfo } from 'src/features/blogs/domain/image.types';
import type { ExtendedLikesInfo } from 'src/features/likes/domain/likes.types';

export class PostViewModel {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: ExtendedLikesInfo,
    public images: ImageInfo,
  ) {}
}

export class PostInfoViewModel {
  constructor(
    public id: string,
    public title: string,
    public blogId: string,
    public blogName: string,
  ) {}
}
