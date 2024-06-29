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
    const query = `
    SELECT "Id" as "id", "Email" as "email", "Login" as "login"
      FROM users 
      WHERE "Id" = $1;
    `;
    const user = await this.dataSource.query(query, [id]);
    return user.length !== 0
      ? new UserInfo(user[0].id.toString(), user[0].login, user[0].email)
      : false;
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const query = `
        SELECT * 
        FROM users 
        WHERE "Email" = $1 OR "Login" = $1;
      `;
    const user = await this.dataSource.query<User[]>(query, [loginOrEmail]);
    return user.length !== 0 ? user[0] : null;
  }

  async getUsers(query?: SearchQueryParametersType): Promise<Paginator<UserViewModel[]>> {
    const sanitizationQuery = getSanitizationQuery(query);

    let condition = '';
    const params: any[] = [];

    if (sanitizationQuery.searchLoginTerm) {
      condition += `"Login" ILIKE $${params.length + 1} `;
      params.push(`%${sanitizationQuery.searchLoginTerm}%`);
    }
    if (sanitizationQuery.searchEmailTerm) {
      if (condition !== '') {
        condition += ' OR ';
      }
      condition += `"Email" ILIKE $${params.length + 1} `;
      params.push(`%${sanitizationQuery.searchEmailTerm}%`);
    }

    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;
    const queryString = `
    SELECT "Id" as "id", "Login" as "login", "Email" as "email", "CreatedAt" as "createdAt"
    FROM users
    ${condition !== '' ? `WHERE ${condition}` : ''}
    ORDER BY "${sanitizationQuery.sortBy}"  ${sanitizationQuery.sortDirection}
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
      Number(usersCount[0]?.count || 0),
      users.map((user) => this.mapToOutput(user)),
    );
  }

  mapToOutput(user: User): UserViewModel {
    return new UserViewModel(user.id!.toString(), user.login, user.email, user.createdAt);
  }
}
