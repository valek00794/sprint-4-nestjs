import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { SearchQueryParametersType } from '../../domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { Paginator } from 'src/features/domain/result.types';
import { BlogView } from '../api/models/output/blogs.output.model';
import { Blog } from './blogs.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getBlogs(query?: SearchQueryParametersType) {
    const sanitizationQuery = getSanitizationQuery(query);

    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;
    const queryString = `
      SELECT "Id" as "id", "Name" as "name", "Description" as "description", 
        "WebsiteUrl" as "websiteUrl", "CreatedAt" as "createdAt",  "IsMembership" as "isMembership"
      FROM "blogs" 
      ${sanitizationQuery.searchNameTerm ? `WHERE "Name" LIKE '%${sanitizationQuery.searchNameTerm}%'` : ''}
      ORDER BY "${sanitizationQuery.sortBy}"  ${sanitizationQuery.sortDirection}
      LIMIT ${sanitizationQuery.pageSize} 
      OFFSET ${offset};
    `;
    console.log(queryString);
    const blogs = await this.dataSource.query<Blog[]>(queryString);
    const countQuery = `
      SELECT COUNT(*)
      FROM "blogs"
      ${sanitizationQuery.searchNameTerm ? `WHERE "Name" LIKE '%${sanitizationQuery.searchNameTerm}%'` : ''};
    `;
    const blogsCount = await this.dataSource.query(countQuery);

    return new Paginator<BlogView[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(blogsCount[0]?.count || 0),
      blogs.map((blog) => this.mapToOutput(blog)),
    );
  }

  async findBlog(id: number): Promise<BlogView | null> {
    if (isNaN(id)) {
      return null;
    }
    const query = `
     SELECT "Id" as "id", "Name" as "name", "Description" as "description", 
        "WebsiteUrl" as "websiteUrl", "CreatedAt" as "createdAt",  "IsMembership" as "isMembership"
      FROM "blogs" 
      WHERE "Id" = '${id}';
    `;
    const blog = await this.dataSource.query(query);
    return blog.length !== 0 ? this.mapToOutput(blog[0]) : null;
  }

  mapToOutput(blog: Blog): BlogView {
    return new BlogView(
      blog.id!.toString(),
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
    );
  }
}
