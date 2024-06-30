import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreatePostForBlogModel } from 'src/features/blogs/api/models/input/blogs.input.model';
import { CreatePostModel } from '../../api/models/input/posts.input.model';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { NotFoundException } from '@nestjs/common';
export class CreatePostCommand {
  constructor(
    public inputModel: CreatePostModel | CreatePostForBlogModel,
    public blogId?: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const getBlogId = command.blogId ? Number(command.blogId) : Number(command.inputModel.blogId);
    if (isNaN(getBlogId)) {
      throw new NotFoundException('Blog not found');
    }
    const blog = await this.blogsRepository.findBlog(getBlogId);
    const newPosts = {
      title: command.inputModel.title,
      shortDescription: command.inputModel.shortDescription,
      content: command.inputModel.content,
      createdAt: new Date().toISOString(),
      blogId: getBlogId,
      blogName: blog!.name,
    };

    return await this.postsRepository.createPost(newPosts);
  }
}
