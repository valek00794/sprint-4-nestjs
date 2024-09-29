import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { FieldError } from 'src/infrastructure/exception.filter.types';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';

export class BindBlogCommand {
  constructor(
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(BindBlogCommand)
export class BindBlogUseCase implements ICommandHandler<BindBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: BindBlogCommand) {
    const blogId = Number(command.id);
    const userId = Number(command.userId);
    if (isNaN(blogId)) {
      throw new BadRequestException([new FieldError('Id is incorrect', 'id')]);
    }
    if (isNaN(userId)) {
      throw new BadRequestException([new FieldError('userId is incorrect', 'userId')]);
    }
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) return false;
    if (blog.blogOwnerInfo) {
      throw new BadRequestException([
        new FieldError('This blogId is incorrect or already have owner', 'id'),
      ]);
    }
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      return false;
    }
    const updatedblog = {
      ...blog,
      blogOwnerInfo: user,
    };
    return await this.blogsRepository.bindBlog(updatedblog);
  }
}
