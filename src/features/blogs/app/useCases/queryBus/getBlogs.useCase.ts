import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';

import { BlogsQueryRepository } from 'src/features/blogs/infrastructure/blogs.query-repository';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { GetBlogImagesQuery } from './getBlogImages.useCase';
import { BlogViewModel } from 'src/features/blogs/api/models/output/blogs.output.model';
import { Paginator } from 'src/features/domain/result.types';
import { getSanitizationQuery } from 'src/features/utils';

export class GetBlogsQuery {
  constructor(
    public queryString?: SearchQueryParametersType,
    public witnBloggerInfo?: boolean,
    public withoutBanned?: boolean,
    public ownerId?: string,
  ) {}
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsUseCase implements IQueryHandler<GetBlogsQuery> {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private queryBus: QueryBus,
  ) {}

  async execute(query: GetBlogsQuery) {
    const sanitizationQuery = getSanitizationQuery(query.queryString);
    const { blogs, count } = await this.blogsQueryRepository.getBlogs(
      query.queryString,
      query.withoutBanned,
      query.ownerId,
    );

    const mapperBlogs: BlogViewModel[] = [];
    const promises = blogs.map(async (blog) => {
      const images = await this.queryBus.execute(new GetBlogImagesQuery(blog.id));
      const blogViewModel = query.witnBloggerInfo
        ? this.blogsQueryRepository.mapToBloggerOutput(blog, images)
        : this.blogsQueryRepository.mapToOutput(blog, images);

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
