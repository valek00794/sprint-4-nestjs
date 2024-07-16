import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { UserViewModel } from '../../api/models/output/users.output.models';
import { Paginator } from 'src/features/domain/result.types';
import type { SearchQueryParametersType } from 'src/features/domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { UserInfo } from '../../domain/users.types';
import { User } from './users.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(User) protected usersRepository: Repository<User>,
  ) {}

  async findUserById(id: number): Promise<UserInfo | false> {
    const user = await this.usersRepository.findOne({
      where: [{ id: id }],
    });
    return user ? new UserInfo(user.id.toString(), user.login, user.email) : false;
  }

  async getUsers(query?: SearchQueryParametersType): Promise<Paginator<UserViewModel[]>> {
    const sanitizationQuery = getSanitizationQuery(query);
    const users = await this.usersRepository.findAndCount();
    return new Paginator<UserViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      users[1],
      users[0].map((user) => this.mapToOutput(user)),
    );
  }

  mapToOutput(user: User): UserViewModel {
    return new UserViewModel(user.id!.toString(), user.login, user.email, user.createdAt);
  }
}
