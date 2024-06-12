import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { CreatePostModel } from '../../api/models/input/posts.input.model';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { isValidMongoId } from 'src/features/utils';

export class UpdatePostCommand {
  constructor(
    public inputModel: CreatePostModel,
    public id: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdatePostCommand) {
    if (!isValidMongoId(command.id)) {
      throw new NotFoundException('Invalid post id');
    }
    const post = await this.postsRepository.findPost(command.id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const updatedPost = {
      title: command.inputModel.title,
      shortDescription: command.inputModel.shortDescription,
      content: command.inputModel.content,
      createdAt: post!.createdAt,
      blogId: command.inputModel.blogId,
      blogName: post!.blogName,
    };
    return await this.postsRepository.updatePost(updatedPost, command.id);
  }
}
