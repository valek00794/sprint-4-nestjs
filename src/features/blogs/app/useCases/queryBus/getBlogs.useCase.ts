import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';

import { BlogsQueryRepository } from 'src/features/blogs/infrastructure/blogs.query-repository';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { GetBlogImagesQuery } from './getBlogImages.useCase';
import { BlogViewModel } from 'src/features/blogs/api/models/output/blogs.output.model';
import { Paginator } from 'src/features/domain/result.types';
import { getSanitizationQuery } from 'src/features/utils';
import { BlogsSubscriberInfoRepository } from 'src/features/blogs/infrastructure/blogs-subscriber-info.repository';

export class GetBlogsQuery {
  constructor(
    public queryString?: SearchQueryParametersType,
    public withoutBanned?: boolean,
    public ownerId?: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsUseCase implements IQueryHandler<GetBlogsQuery> {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsSubscriberInfoRepository: BlogsSubscriberInfoRepository,
    private queryBus: QueryBus,
  ) {}

  async execute(query: GetBlogsQuery) {
    const sanitizationQuery = getSanitizationQuery(query.queryString);
    const { blogs, count } = await this.blogsQueryRepository.getBlogs(
      query.queryString,
      query.withoutBanned,
      query.ownerId,
    );
    const mapperBlogs = await Promise.all(
      blogs.map(async (blog) => {
        const images = await this.queryBus.execute(new GetBlogImagesQuery(blog.id));
        const subscribers = await this.blogsSubscriberInfoRepository.getSubscribersByBlogId(
          blog.id,
        );
        return this.blogsQueryRepository.mapToOutput(blog, subscribers, images, query.userId);
      }),
    );

    return new Paginator<BlogViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      count,
      mapperBlogs,
    );
  }
}
