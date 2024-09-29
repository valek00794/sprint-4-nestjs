import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateBlogInputModel } from '../../api/models/input/blogs.input.model';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { BadRequestException } from '@nestjs/common';
import { FieldError } from 'src/infrastructure/exception.filter.types';

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
    const userId = Number(command.userId);
    if (isNaN(userId)) {
      throw new BadRequestException([new FieldError('UserId is incorrect', 'userId')]);
    }
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new BadRequestException([new FieldError('UserId is incorrect', 'userId')]);
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
