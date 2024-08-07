import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { CreateBlogInputModel } from '../../api/models/input/blogs.input.model';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public inputModel: CreateBlogInputModel,
    public id: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand) {
    const blogId = Number(command.id);
    if (isNaN(blogId)) {
      throw new NotFoundException('Blog not found');
    }
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const updatedblog = {
      name: command.inputModel.name,
      description: command.inputModel.description,
      websiteUrl: command.inputModel.websiteUrl,
      createdAt: new Date(blog.createdAt).toISOString(),
      isMembership: false,
    };
    return await this.blogsRepository.updateBlog(updatedblog, blogId);
  }
}
