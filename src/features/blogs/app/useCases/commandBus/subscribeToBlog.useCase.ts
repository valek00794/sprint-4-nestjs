import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';

export class SubscribeToBlogCommand {
  constructor(
    public blogId: string,
    public userId?: string,
  ) {}
}

@CommandHandler(SubscribeToBlogCommand)
export class SubscribeToBlogUseCase implements ICommandHandler<SubscribeToBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: SubscribeToBlogCommand) {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const blog = await this.blogsRepository.findBlogById(user.id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.blogsRepository.subscribeToBlog(command.blogId, user.id);
  }
}
