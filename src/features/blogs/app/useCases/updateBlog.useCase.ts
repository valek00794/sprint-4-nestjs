import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { CreateBlogInputModel } from '../../api/models/input/blogs.input.model';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { FieldError } from 'src/infrastructure/exception.filter.types';
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
    const blogId = Number(command.id);
    const userId = Number(command.userId);

    if (isNaN(blogId)) {
      throw new BadRequestException([new FieldError('BlogId is incorrect', 'id')]);
    }

    if (isNaN(userId)) {
      throw new BadRequestException([new FieldError('UserId is incorrect', 'userId')]);
    }
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) {
      throw new BadRequestException([new FieldError('BlogId is incorrect', 'id')]);
    }

    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new BadRequestException([new FieldError('UserId is incorrect', 'userId')]);
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
    return await this.blogsRepository.updateBlog(updatedblog, blogId);
  }
}
