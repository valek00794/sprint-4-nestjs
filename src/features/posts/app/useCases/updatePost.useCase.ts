import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CreatePostModel } from '../../api/models/input/posts.input.model';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public inputModel: CreatePostModel,
    public postId: string,
    public blogId?: number,
    public userId?: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdatePostCommand) {
    const getBlogId = command.inputModel.blogId
      ? Number(command.inputModel.blogId)
      : command.blogId!;
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
      throw new ForbiddenException('User try to update post that doesnt belong to current user');
    }
    const updatedPost = {
      title: command.inputModel.title,
      shortDescription: command.inputModel.shortDescription,
      content: command.inputModel.content,
      createdAt: new Date(post!.createdAt).toISOString(),
      blogId: getBlogId,
    };
    return await this.postsRepository.updatePost(updatedPost, postId);
  }
}
