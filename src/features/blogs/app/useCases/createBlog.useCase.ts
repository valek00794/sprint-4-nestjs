import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateBlogInputModel } from '../../api/models/input/blogs.input.model';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(public inputModel: CreateBlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand) {
    const newBlog = {
      name: command.inputModel.name,
      description: command.inputModel.description,
      websiteUrl: command.inputModel.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    return await this.blogsRepository.createBlog(newBlog);
  }
}
