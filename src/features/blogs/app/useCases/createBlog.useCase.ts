import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { CreateBlogInputModel } from '../../api/models/input/blogs.input.model';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';

export class CreateBlogCommand {
  constructor(
    public inputModel: CreateBlogInputModel,
    public userId?: string,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateBlogCommand) {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const newBlog = {
      name: command.inputModel.name,
      description: command.inputModel.description,
      websiteUrl: command.inputModel.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerInfo: user,
    };
    return await this.blogsRepository.createBlog(newBlog);
  }
}
