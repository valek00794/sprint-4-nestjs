import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
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
    if (!Types.ObjectId.isValid(command.id)) {
      throw new NotFoundException('Invalid ID');
    }
    const blog = await this.blogsRepository.findBlog(command.id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const updatedblog = {
      name: command.inputModel.name,
      description: command.inputModel.description,
      websiteUrl: command.inputModel.websiteUrl,
      createdAt: blog!.createdAt,
      isMembership: false,
    };
    return await this.blogsRepository.updateBlog(updatedblog, command.id);
  }
}
