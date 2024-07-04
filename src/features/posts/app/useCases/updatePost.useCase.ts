import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { CreatePostModel } from '../../api/models/input/posts.input.model';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public inputModel: CreatePostModel,
    public postId: string,
    public blogId?: number,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdatePostCommand) {
    if (isNaN(Number(command.postId))) {
      throw new NotFoundException('Blog not found');
    }
    const post = await this.postsRepository.findPost(command.postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const getBlogId = command.inputModel.blogId
      ? Number(command.inputModel.blogId)
      : command.blogId!;
    if (isNaN(getBlogId)) {
      throw new NotFoundException('Blog not found');
    }
    const updatedPost = {
      title: command.inputModel.title,
      shortDescription: command.inputModel.shortDescription,
      content: command.inputModel.content,
      createdAt: new Date(post!.createdAt).toISOString(),
      blogId: getBlogId,
      blogName: post!.blogName,
    };
    return await this.postsRepository.updatePost(updatedPost, command.postId);
  }
}
