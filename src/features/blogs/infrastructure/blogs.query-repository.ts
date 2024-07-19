import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { SearchQueryParametersType } from '../../domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { Paginator } from 'src/features/domain/result.types';
import { BlogViewModel } from '../api/models/output/blogs.output.model';
import { Blog } from './blogs.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectRepository(Blog) protected blogsRepository: Repository<Blog>) {}

  async getBlogs(query?: SearchQueryParametersType) {
    const sanitizationQuery = getSanitizationQuery(query);

    const take = sanitizationQuery.pageSize;
    const skip = sanitizationQuery.pageSize * (sanitizationQuery.pageNumber - 1);

    const where: any = {};

    if (sanitizationQuery.searchNameTerm) {
      where.name = ILike(`%${sanitizationQuery.searchNameTerm}%`);
    }
    const [blogs, count] = await this.blogsRepository.findAndCount({
      select: ['id', 'name', 'description', 'websiteUrl', 'createdAt', 'isMembership'],
      where: { name: where.name },
      order: {
        [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection,
      },
      take,
      skip,
    });
    return new Paginator<BlogViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(count),
      blogs.map((user) => this.mapToOutput(user)),
    );
  }

  async findBlogById(id: number): Promise<BlogViewModel | null> {
    const blog = await this.blogsRepository.findOne({
      where: [{ id: id }],
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
}
