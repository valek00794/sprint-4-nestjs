import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';
import { GetPostImagesQuery } from './getPostImages.useCase';

export class GetPostsQuery {
  constructor(
    public queryString?: SearchQueryParametersType,
    public blogId?: string,
    public userId?: string,
    public withoutBanned?: boolean,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsUseCase implements IQueryHandler<GetPostsQuery> {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private queryBus: QueryBus,
  ) {}

  async execute(query: GetPostsQuery) {
    const posts = await this.postsQueryRepository.getPosts(
      query.queryString,
      query.blogId,
      query.userId,
      query.withoutBanned,
    );

    if (!posts) {
      throw new NotFoundException('Posts not found');
    }

    await Promise.all(
      posts.items.map(async (post) => {
        const images = await this.queryBus.execute(new GetPostImagesQuery(post.id));
        post.images = images;
      }),
    );

    return posts;
  }
}
