import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CreateBlogInputModel } from '../../api/models/input/blogs.input.model';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';

export class UpdateBlogCommand {
  constructor(
    public inputModel: CreateBlogInputModel,
    public id: string,
    public userId?: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdateBlogCommand) {
    const blog = await this.blogsRepository.findBlogById(command.id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id !== blog.blogOwnerInfo?.id) {
      throw new ForbiddenException('User try to update blog that doesnt belong to current user');
    }

    const updatedblog = {
      name: command.inputModel.name,
      description: command.inputModel.description,
      websiteUrl: command.inputModel.websiteUrl,
      createdAt: new Date(blog.createdAt).toISOString(),
      isMembership: false,
      blogOwnerInfo: user,
    };
    return await this.blogsRepository.updateBlog(updatedblog, command.id);
  }
}
