import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { UserViewModel } from '../../api/models/output/users.output.models';
import { Paginator } from 'src/features/domain/result.types';
import type { SearchQueryParametersType } from 'src/features/domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { UserInfo } from '../../domain/users.types';
import { User } from './users.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectRepository(User) protected usersRepository: Repository<User>) {}

  async findUserById(id: number): Promise<UserInfo | false> {
    const user = await this.usersRepository.findOne({
      where: [{ id: id }],
    });
    return user ? new UserInfo(user.id.toString(), user.login, user.email) : false;
  }

  async getUsers(query?: SearchQueryParametersType): Promise<Paginator<UserViewModel[]>> {
    const sanitizationQuery = getSanitizationQuery(query);

    const take = sanitizationQuery.pageSize;
    const skip = sanitizationQuery.pageSize * (sanitizationQuery.pageNumber - 1);

    const where: any = {};

    if (sanitizationQuery.searchLoginTerm) {
      where.login = ILike(`%${sanitizationQuery.searchLoginTerm}%`);
    }
    if (sanitizationQuery.searchEmailTerm) {
      where.email = ILike(`%${sanitizationQuery.searchEmailTerm}%`);
    }
    const [users, count] = await this.usersRepository.findAndCount({
      select: ['id', 'login', 'email', 'createdAt'],
      where: [{ login: where.login }, { email: where.email }],
      order: {
        [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection,
      },
      take,
      skip,
    });

    return new Paginator<UserViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(count),
      users.map((user) => this.mapToOutput(user)),
    );
  }

  mapToOutput(user: User): UserViewModel {
    return new UserViewModel(user.id!.toString(), user.login, user.email, user.createdAt);
  }
}
