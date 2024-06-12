import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserViewModel } from '../../api/models/output/users.output.models';
import { Paginator } from 'src/features/domain/result.types';
import type { SearchQueryParametersType } from 'src/features/domain/query.types';
import { getSanitizationQuery, isValidMongoId } from 'src/features/utils';
import { UserInfo } from '../../domain/users.types';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUserById(id: string): Promise<UserInfo | false> {
    if (!isValidMongoId(id)) {
      return false;
    }
    const user = await this.userModel.findById(id);
    return user ? new UserInfo(user.email, user.login, id) : false;
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }

  async getUsers(query?: SearchQueryParametersType) {
    const sanitizationQuery = getSanitizationQuery(query);
    const findOptions = {
      $or: [
        sanitizationQuery.searchLoginTerm !== null
          ? { login: { $regex: sanitizationQuery.searchLoginTerm, $options: 'i' } }
          : {},
        sanitizationQuery.searchEmailTerm !== null
          ? { email: { $regex: sanitizationQuery.searchEmailTerm, $options: 'i' } }
          : {},
      ],
    };
    const users = await this.userModel
      .find(findOptions)
      .sort({ [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection })
      .skip((sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize)
      .limit(sanitizationQuery.pageSize);

    const usersCount = await this.userModel.countDocuments(findOptions);

    return new Paginator<UserViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      usersCount,
      users.map((user) => this.mapToOutput(user)),
    );
  }

  mapToOutput(user: UserDocument): UserViewModel {
    return new UserViewModel(user._id, user.login, user.email, user.createdAt);
  }
}
