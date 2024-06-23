import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { UserViewModel } from '../../api/models/output/users.output.models';
import { Paginator } from 'src/features/domain/result.types';
import type { SearchQueryParametersType } from 'src/features/domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { UserInfo } from '../../domain/users.types';
import { User } from './users.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findUserById(id: string): Promise<UserInfo | false> {
    const query = 'SELECT * FROM users WHERE id = $1;';
    const user = await this.dataSource.query(query, [id]);
    return user ? new UserInfo(user.email, user.login, id) : false;
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const query = `
        SELECT * 
        FROM users 
        WHERE email = $1 OR login = $1;
      `;
    const user = await this.dataSource.query<User[]>(query, [loginOrEmail]);
    return user ? user[0] : null;
  }

  async getUsers(query?: SearchQueryParametersType): Promise<Paginator<UserViewModel[]>> {
    const sanitizationQuery = getSanitizationQuery(query);

    let condition = '';
    const params: any[] = [];

    if (sanitizationQuery.searchLoginTerm) {
      condition += `login ILIKE $${params.length + 1} `;
      params.push(`%${sanitizationQuery.searchLoginTerm}%`);
    }
    if (sanitizationQuery.searchEmailTerm) {
      if (condition !== '') {
        condition += ' OR ';
      }
      condition += `email ILIKE $${params.length + 1} `;
      params.push(`%${sanitizationQuery.searchEmailTerm}%`);
    }

    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;

    const queryString = `
    SELECT *
    FROM users
    ${condition !== '' ? `WHERE ${condition}` : ''}
    ORDER BY ${sanitizationQuery.sortBy} ${sanitizationQuery.sortDirection}
    LIMIT ${sanitizationQuery.pageSize} 
    OFFSET ${offset};
  `;

    const users = await this.dataSource.query<User[]>(queryString, params);

    const countQuery = `
    SELECT COUNT(*)
    FROM users
    ${condition !== '' ? `WHERE ${condition}` : ''};
  `;
    const usersCount = await this.dataSource.query(countQuery, params);

    return new Paginator<UserViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      usersCount[0]?.count || 0,
      users.map((user) => this.mapToOutput(user)),
    );
  }

  mapToOutput(user: User): UserViewModel {
    return new UserViewModel(user.id, user.login, user.email, user.createdAt);
  }
}
