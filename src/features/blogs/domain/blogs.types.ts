import { User } from 'src/features/users/infrastructure/users/users.entity';

export class BlogType {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public blogOwnerInfo: User,
  ) {}
}

export enum BlogImageType {
  Wallpaper = 'wallpaper',
  Icon = 'icon',
}

export enum PostImageSize {
  Original = 'original',
  Middle = 'middle',
  Small = 'small',
}
