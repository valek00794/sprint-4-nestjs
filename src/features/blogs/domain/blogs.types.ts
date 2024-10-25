import { User } from 'src/features/users/infrastructure/users/user.entity';

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
