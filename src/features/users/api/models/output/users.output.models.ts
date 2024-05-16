import type { Types } from 'mongoose';

export class UserViewModel {
  constructor(
    public id: Types.ObjectId,
    public login: string,
    public email: string,
    public createdAt: string,
  ) {}
}
