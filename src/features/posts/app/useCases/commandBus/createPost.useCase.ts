import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreatePostForBlogModel } from 'src/features/blogs/api/models/input/blogs.input.model';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreatePostModel } from 'src/features/posts/api/models/input/posts.input.model';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';
export class CreatePostCommand {
  constructor(
    public inputModel: CreatePostModel | CreatePostForBlogModel,
    public blogId?: string,
    public userId?: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const getBlogId = command.blogId ? command.blogId : command.inputModel.blogId;
    const blog = await this.blogsRepository.findBlogById(getBlogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    if (command.userId !== blog.blogOwnerInfo!.id) {
      throw new ForbiddenException(
        'The user is trying to create a post for a blog that does not belong to them.',
      );
    }
    const newPosts = {
      title: command.inputModel.title,
      shortDescription: command.inputModel.shortDescription,
      content: command.inputModel.content,
      createdAt: new Date().toISOString(),
      blogId: getBlogId,
    };

    return await this.postsRepository.createPost(newPosts);
  }
}
