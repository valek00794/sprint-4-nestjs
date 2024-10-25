import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SearchQueryParametersType } from '../../domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { BlogOwnerInfo, BlogViewModel } from '../api/models/output/blogs.output.model';
import { Blog } from './blogs.entity';
import { ImageInfo } from '../domain/image.types';
import { SubscriptionStatuses } from '../domain/subscriber.type';
import { BlogSubscriberInfo } from './blogs-subscriber-info.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectRepository(Blog) protected blogsRepository: Repository<Blog>) {}

  async getBlogs(
    queryString?: SearchQueryParametersType,
    withoutBanned?: boolean,
    ownerId?: string,
  ): Promise<{
    blogs: Blog[];
    count: number;
  }> {
    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;

    const qb = this.blogsRepository.createQueryBuilder('blog');
    const query = qb
      .leftJoinAndSelect('blog.blogOwnerInfo', 'blogOwnerInfo')
      .select([
        'blog.id',
        'blog.name',
        'blog.description',
        'blog.websiteUrl',
        'blog.createdAt',
        'blog.isMembership',
        'blog.isBanned',
        'blog.banDate',
        'blogOwnerInfo.id',
        'blogOwnerInfo.login',
      ])
      .orderBy(`blog.${sanitizationQuery.sortBy}`, sanitizationQuery.sortDirection)
      .offset(offset)
      .limit(sanitizationQuery.pageSize);

    if (withoutBanned) {
      qb.where('blog.isBanned = :isBanned', { isBanned: false });
    }

    if (ownerId) {
      qb.where('blogOwnerInfo.id = :ownerId', { ownerId });
    }

    if (sanitizationQuery.searchNameTerm) {
      qb.andWhere('blog.name ILIKE :searchTerm', {
        searchTerm: `%${sanitizationQuery.searchNameTerm}%`,
      });
    }

    const [blogs, count] = await query.getManyAndCount();

    return { blogs, count };
  }

  async findUnbannedBlogById(id: string) {
    const blog = await this.blogsRepository.findOne({
      where: [{ id, isBanned: false }],
      relations: {
        blogOwnerInfo: true,
      },
    });

    return blog ? blog : null;
  }

  async findBlogById(id: string): Promise<Blog | null> {
    const blog = await this.blogsRepository.findOne({
      where: [{ id }],
      relations: {
        blogOwnerInfo: true,
      },
    });
    return blog;
  }

  mapToOutput(
    blog: Blog,
    subscribers?: BlogSubscriberInfo[],
    images?: ImageInfo,
    userId?: string,
  ): BlogViewModel {
    const subscribersCount = subscribers
      ? subscribers.filter((sub) => sub.status === SubscriptionStatuses.Subscribed).length
      : 0;
    let currentUserSubscriptionStatus = SubscriptionStatuses.None;
    if (userId && subscribers && subscribers.length !== 0) {
      const userSubscription = subscribers.find((subscriber) => subscriber.userId === userId);
      if (userSubscription) {
        currentUserSubscriptionStatus = userSubscription.status;
      }
    }

    return new BlogViewModel(
      blog.id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
      images ? images : new ImageInfo([], null),
      subscribersCount,
      currentUserSubscriptionStatus,
    );
  }

  mapToAdminOutput(blog: Blog): BlogViewModel {
    const banInfo = { isBanned: blog.isBanned, banDate: blog.banDate };
    return new BlogViewModel(
      blog.id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
      undefined,
      undefined,
      undefined,
      banInfo,
      blog.blogOwnerInfo
        ? new BlogOwnerInfo(blog.blogOwnerInfo.id, blog.blogOwnerInfo.login)
        : null,
    );
  }
}
