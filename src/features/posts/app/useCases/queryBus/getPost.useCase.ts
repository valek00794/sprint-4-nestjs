import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';

import { NotFoundException } from '@nestjs/common';
import { PostsQueryRepository } from '../../../infrastructure/posts.query-repository';
import { LikesQueryRepository } from 'src/features/likes/infrastructure/likes.query-repository';
import { GetPostImagesQuery } from './getPostImages.useCase';

export class GetPostQuery {
  constructor(
    public id: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostQuery)
export class GetPostUseCase implements IQueryHandler<GetPostQuery> {
  constructor(
    protected postsQueryRepository: PostsQueryRepository,
    protected likesQueryRepository: LikesQueryRepository,
    private queryBus: QueryBus,
  ) {}

  async execute(command: GetPostQuery) {
    const post = await this.postsQueryRepository.findPostById(command.id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (
      post.blog.blogOwnerInfo &&
      post.blog.blogOwnerInfo.banInfo &&
      post.blog.blogOwnerInfo.banInfo.isBanned
    ) {
      throw new NotFoundException('Post not found');
    }

    const mapedlikesInfo = this.likesQueryRepository.mapExtendedLikesInfo(
      post.likes,
      command.userId,
    );
    const images = await this.queryBus.execute(new GetPostImagesQuery(post.id));
    return this.postsQueryRepository.mapToOutput(post, mapedlikesInfo, images);
  }
}
