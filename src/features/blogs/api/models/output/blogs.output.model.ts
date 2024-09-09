export class BlogOwnerInfo {
  constructor(
    public userId: string,
    public userLogin: string,
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
    public blogOwnerInfo: BlogOwnerInfo | null,
  ) {}
}
