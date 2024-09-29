import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';

export class DeletePostCommand {
  constructor(
    public postId: string,
    public blogId?: number,
    public userId?: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: DeletePostCommand) {
    const getBlogId = command.blogId!;
    const postId = Number(command.postId);
    const userId = Number(command.userId);
    if (isNaN(getBlogId) || isNaN(postId) || isNaN(userId)) {
      throw new NotFoundException('BlogId, PostId or UserId syntax error');
    }
    const post = await this.postsRepository.findPostbyId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const blog = await this.blogsRepository.findBlogById(getBlogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    if (userId !== blog.blogOwnerInfo!.id) {
      throw new ForbiddenException('User try to delete post that doesnt belong to current user');
    }
    return await this.postsRepository.deletePost(postId);
  }
}
