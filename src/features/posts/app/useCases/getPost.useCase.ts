import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { NotFoundException } from '@nestjs/common';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { LikesQueryRepository } from 'src/features/likes/infrastructure/likes.query-repository';

export class GetPostCommand {
  constructor(
    public id: string,
    public userId?: string,
  ) {}
}

@CommandHandler(GetPostCommand)
export class GetPostUseCase implements ICommandHandler<GetPostCommand> {
  constructor(
    protected postsQueryRepository: PostsQueryRepository,
    protected likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute(command: GetPostCommand) {
    const postId = Number(command.id);
    const userId = command.userId ? Number(command.userId) : null;
    if (isNaN(postId)) {
      throw new NotFoundException('id syntax error');
    }
    const post = await this.postsQueryRepository.findPostById(postId);
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

    const mapedlikesInfo = this.likesQueryRepository.mapExtendedLikesInfo(post.likes, userId);
    return this.postsQueryRepository.mapToOutput(post, mapedlikesInfo);
  }
}
