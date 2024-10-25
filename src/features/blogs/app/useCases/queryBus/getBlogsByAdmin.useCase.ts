import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { BlogsQueryRepository } from 'src/features/blogs/infrastructure/blogs.query-repository';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { BlogViewModel } from 'src/features/blogs/api/models/output/blogs.output.model';
import { Paginator } from 'src/features/domain/result.types';
import { getSanitizationQuery } from 'src/features/utils';

export class GetBlogsByAdminQuery {
  constructor(public queryString?: SearchQueryParametersType) {}
}

@QueryHandler(GetBlogsByAdminQuery)
export class GetBlogsByAdminUseCase implements IQueryHandler<GetBlogsByAdminQuery> {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute(query: GetBlogsByAdminQuery) {
    const sanitizationQuery = getSanitizationQuery(query.queryString);
    const { blogs, count } = await this.blogsQueryRepository.getBlogs(query.queryString, true);

    const mapperBlogs: BlogViewModel[] = [];
    const promises = blogs.map(async (blog) => {
      const blogViewModel = this.blogsQueryRepository.mapToAdminOutput(blog);
      mapperBlogs.push(blogViewModel);
    });

    await Promise.all(promises);

    return new Paginator<BlogViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      count,
      mapperBlogs,
    );
  }
}
