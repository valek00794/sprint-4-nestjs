import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SearchQueryParametersType, SortDirection } from 'src/features/domain/query.types';
import { Paginator } from 'src/features/domain/result.types';
import { getSanitizationQuery } from 'src/features/utils';
import { BannedUserForBlogViewModel } from '../../api/models/output/users.output.models';
import { UsersBanInfoForBlogs } from './usersBanInfoForBlogs.entity';

@Injectable()
export class BanInfoQueryRepository {
  constructor(
    @InjectRepository(UsersBanInfoForBlogs)
    protected usersBanInfoForBlogsRepository: Repository<UsersBanInfoForBlogs>,
  ) {}
  async getBannedUsersForBlog(blogId: number, query?: SearchQueryParametersType) {
    const sanitizationQuery = getSanitizationQuery(query);

    const take = sanitizationQuery.pageSize;
    const skip = sanitizationQuery.pageSize * (sanitizationQuery.pageNumber - 1);

    const queryBuilder = await this.usersBanInfoForBlogsRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.bannedUser', 'user')
      .where('b.blogId = :blogId', { blogId })
      .orderBy(
        `user.${sanitizationQuery.sortBy}`,
        sanitizationQuery.sortDirection.toUpperCase() as SortDirection,
      )
      .take(take)
      .skip(skip);

    if (sanitizationQuery.searchLoginTerm) {
      queryBuilder.andWhere('user.login ILIKE :searchTerm', {
        searchTerm: `%${sanitizationQuery.searchLoginTerm}%`,
      });
    }

    const [bannedUsers, count] = await queryBuilder.getManyAndCount();

    return new Paginator<BannedUserForBlogViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      count,
      bannedUsers.map((user) => this.mapBannedUserForBlogToOutput(user)),
    );
  }

  mapBannedUserForBlogToOutput(user: UsersBanInfoForBlogs): BannedUserForBlogViewModel {
    return new BannedUserForBlogViewModel(user.userId.toString(), user.bannedUser.login, {
      isBanned: user.isBanned,
      banDate: user.banDate,
      banReason: user.banReason,
    });
  }
}
