import { ImageInfo, ImageType } from 'src/features/blogs/domain/image.types';

export class BlogOwnerInfo {
  constructor(
    public userId: string,
    public userLogin: string,
  ) {}
}

export class BanInfo {
  constructor(
    public isBanned: boolean,
    public banDate: string | null,
  ) {}
}

export class BlogViewModel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public images: ImageInfo,
    public banInfo?: BanInfo,
    public blogOwnerInfo?: BlogOwnerInfo | null,
  ) {}
}
