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
    const getBlogId = command.inputModel.blogId
      ? Number(command.inputModel.blogId)
      : command.blogId!;
    const postId = Number(command.postId);
    if (isNaN(getBlogId) || isNaN(postId)) {
      throw new NotFoundException('BlogId or PostId syntax error');
    }
    const post = await this.postsRepository.findPostbyId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const blog = await this.blogsRepository.findBlogById(getBlogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const updatedPost = {
      title: command.inputModel.title,
      shortDescription: command.inputModel.shortDescription,
      content: command.inputModel.content,
      createdAt: new Date(post!.createdAt).toISOString(),
      blogId: getBlogId,
      //blogName: post.blog.name,
    };
    return await this.postsRepository.updatePost(updatedPost, postId);
  }
}
