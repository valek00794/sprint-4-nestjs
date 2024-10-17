import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SearchQueryParametersType } from '../../domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { Paginator } from 'src/features/domain/result.types';
import { BlogOwnerInfo, BlogViewModel } from '../api/models/output/blogs.output.model';
import { Blog } from './blogs.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectRepository(Blog) protected blogsRepository: Repository<Blog>) {}

  async getBlogs(
    queryString?: SearchQueryParametersType,
    witnBloggerInfo?: boolean,
    withoutBanned?: boolean,
    ownerId?: string,
  ): Promise<Paginator<BlogViewModel[]>> {
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

    return new Paginator<BlogViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(count),
      witnBloggerInfo
        ? blogs.map((blog) => this.mapToBloggerOutput(blog))
        : blogs.map((blog) => this.mapToOutput(blog)),
    );
  }

  async findUnbannedBlogById(id: string): Promise<BlogViewModel | null> {
    const blog = await this.blogsRepository.findOne({
      where: [{ id, isBanned: false }],
    });
    return blog ? this.mapToOutput(blog) : null;
  }

  async findBlogById(id: string): Promise<Blog | null> {
    const blog = await this.blogsRepository.findOne({
      where: [{ id }],
    });
    return blog;
  }

  mapToOutput(blog: Blog): BlogViewModel {
    return new BlogViewModel(
      blog.id!.toString(),
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
    );
  }

  mapToBloggerOutput(blog: Blog): BlogViewModel {
    const banInfo = { isBanned: blog.isBanned, banDate: blog.banDate };
    return new BlogViewModel(
      blog.id!.toString(),
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
      banInfo,
      blog.blogOwnerInfo
        ? new BlogOwnerInfo(blog.blogOwnerInfo.id.toString(), blog.blogOwnerInfo.login)
        : null,
    );
  }
}
