export class UserViewModel {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
    public banInfo: BanInfo,
  ) {}
}

export class BanInfo {
  constructor(
    public banDate: string | null,
    public banReason: string | null,
    public isBanned: boolean,
  ) {}
}

export class BannedUserForBlogViewModel {
  constructor(
    public id: string,
    public login: string,
    public banInfo: BanInfo,
  ) {}
}
