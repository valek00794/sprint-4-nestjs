import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { BlogsQueryRepository } from 'src/features/blogs/infrastructure/blogs.query-repository';
import { GetBlogImagesQuery } from './getBlogImages.useCase';

import { BlogsSubscriberInfoRepository } from 'src/features/blogs/infrastructure/blogs-subscriber-info.repository';

export class GetBlogQuery {
  constructor(
    public blogId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetBlogQuery)
export class GetBlogUseCase implements IQueryHandler<GetBlogQuery> {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsSubscriberInfoRepository: BlogsSubscriberInfoRepository,
    private queryBus: QueryBus,
  ) {}

  async execute(query: GetBlogQuery) {
    const blog = await this.blogsQueryRepository.findUnbannedBlogById(query.blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const subscribers = await this.blogsSubscriberInfoRepository.getSubscribersByBlogId(blog.id);

    const images = await this.queryBus.execute(new GetBlogImagesQuery(blog.id));
    return this.blogsQueryRepository.mapToOutput(blog, subscribers, images, query.userId);
  }
}
