import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';

export class DeleteBlogCommand {
  constructor(
    public id: string,
    public userId?: string,
  ) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: DeleteBlogCommand) {
    const blogId = Number(command.id);
    const userId = Number(command.userId);

    if (isNaN(blogId)) {
      return false;
    }

    if (isNaN(userId)) {
      return false;
    }
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) {
      return false;
    }

    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      return false;
    }

    if (user.id !== blog.blogOwnerInfo?.id) {
      throw new ForbiddenException('User try to delete blog that doesnt belong to current user');
    }

    return await this.blogsRepository.deleteBlog(blogId);
  }
}
