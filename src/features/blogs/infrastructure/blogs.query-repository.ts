import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

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
    ownerId?: number,
  ): Promise<Paginator<BlogViewModel[]>> {
    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;
    const where: any = {};

    if (sanitizationQuery.searchNameTerm) {
      where.name = ILike(`%${sanitizationQuery.searchNameTerm.toLowerCase()}%`);
    }
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
        'blogOwnerInfo.id',
        'blogOwnerInfo.login',
      ])
      .orderBy(`blog.${sanitizationQuery.sortBy}`, sanitizationQuery.sortDirection)
      .offset(offset)
      .limit(sanitizationQuery.pageSize);

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

  async findBlogById(id: number): Promise<BlogViewModel | null> {
    const blog = await this.blogsRepository.findOne({
      where: [{ id }],
    });
    return blog ? this.mapToOutput(blog) : null;
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
    return new BlogViewModel(
      blog.id!.toString(),
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
      blog.blogOwnerInfo
        ? new BlogOwnerInfo(blog.blogOwnerInfo.id.toString(), blog.blogOwnerInfo.login)
        : null,
    );
  }
}
