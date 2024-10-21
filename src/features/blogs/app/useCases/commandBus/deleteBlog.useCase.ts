import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';

import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';

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
    const blog = await this.blogsRepository.findBlogById(command.id);
    if (!blog) {
      return false;
    }

    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) {
      return false;
    }

    if (user.id !== blog.blogOwnerInfo?.id) {
      throw new ForbiddenException('User try to delete blog that doesnt belong to current user');
    }

    return await this.blogsRepository.deleteBlog(command.id);
  }
}
