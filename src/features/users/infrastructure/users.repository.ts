import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(newUser: UserDocument) {
    const user = new this.userModel(newUser);
    await user.save();
    return user;
  }

  async deleteUserById(id: string): Promise<boolean> {
    const deleteResult = await this.userModel.findByIdAndDelete(id);
    return deleteResult ? true : false;
  }
}
